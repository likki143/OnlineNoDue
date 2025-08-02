import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/auth";
import { isDemoMode, disableDemoMode } from "@/lib/demo-auth";
import {
  applicationStore,
  Application,
  AuditLog,
} from "@/lib/applicationStore";
import { firebaseApplicationService } from "@/lib/firebaseApplicationService";
import { sendStudentNotificationEmail } from "@/lib/utils/emailService";
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Users,
  Eye,
  Check,
  X,
  Search,
  Filter,
  Download,
  BarChart3,
  Calendar,
  TrendingUp,
  MessageSquare,
  Settings,
  Bell,
  RefreshCw,
} from "lucide-react";

const DepartmentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [comments, setComments] = useState("");

  // Data states
  const [applications, setApplications] = useState<Application[]>([]);
  const [departmentStats, setDepartmentStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgProcessingTime: 0,
  });

  // Get user's department in lowercase for matching
  const userDepartment = userProfile?.department?.toLowerCase() || "";

  useEffect(() => {
    refreshData();
  }, [userDepartment]);

  const refreshData = async () => {
    if (!userDepartment) return;

    try {
      const allApplications = await firebaseApplicationService.getAllApplications();

      // Filter applications that need review from this department
      const departmentApplications = allApplications.filter((app) =>
        app.progress.hasOwnProperty(userDepartment),
      );

      setApplications(departmentApplications);

      // Calculate department statistics
      const stats = {
        total: departmentApplications.length,
        pending: departmentApplications.filter(
          (app) =>
            app.progress[userDepartment as keyof typeof app.progress] ===
            "pending",
        ).length,
        approved: departmentApplications.filter(
          (app) =>
            app.progress[userDepartment as keyof typeof app.progress] ===
            "approved",
        ).length,
        rejected: departmentApplications.filter(
          (app) =>
            app.progress[userDepartment as keyof typeof app.progress] ===
            "rejected",
        ).length,
        avgProcessingTime: 2.5, // Mock data - in real app would calculate from timestamps
      };

      setDepartmentStats(stats);
    } catch (error) {
      console.error("Error refreshing department data:", error);
      // Set empty state on error
      setApplications([]);
      setDepartmentStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        avgProcessingTime: 0,
      });
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (app) =>
          app.progress[userDepartment as keyof typeof app.progress] ===
          activeTab,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const handleApplicationAction = async (
    application: Application,
    action: "approve" | "reject",
    comment?: string,
  ) => {
    setLoading(true);
    setError("");

    try {
      // Update application progress for this department
      const departmentUpdate = {
        [userDepartment]: action === "approve" ? "approved" : "rejected",
      };

      await firebaseApplicationService.updateApplicationStatus(
        application.id,
        departmentUpdate,
        application.studentId,
      );

      // Add audit log
      applicationStore.addAuditLog({
        userId: userProfile?.uid || "",
        userName: userProfile?.fullName || "",
        action:
          action === "approve"
            ? "Application Approved"
            : "Application Rejected",
        target: `Application #${application.id}`,
        details: `${userProfile?.department} department ${action}d application${comment ? ` with comment: ${comment}` : ""}`,
        ipAddress: "192.168.1.100",
      });

      // Send email notification to student
      try {
        await sendStudentNotificationEmail({
          studentName: application.studentName,
          studentEmail: application.email,
          applicationId: application.id,
          department: userProfile?.department || userDepartment,
          action: action,
          comments: comment,
          officerName: userProfile?.fullName || "Department Officer",
        });
      } catch (emailError) {
        console.log("Email notification failed:", emailError);
        // Don't fail the main action if email fails
      }

      setSuccess(
        `Application ${action}d successfully! Student has been notified via email.`,
      );
      refreshData();
      setShowDialog(false);
      setSelectedApplication(null);
      setComments("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} application`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (
    application: Application,
    action: "approve" | "reject",
  ) => {
    setSelectedApplication(application);
    setActionType(action);
    setShowDialog(true);
    setComments("");
  };

  const handleBulkAction = async (action: "approve" | "reject") => {
    const pendingApplications = getFilteredApplications().filter(
      (app) =>
        app.progress[userDepartment as keyof typeof app.progress] === "pending",
    );

    if (pendingApplications.length === 0) {
      setError("No pending applications to process");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} all ${pendingApplications.length} pending applications?`;
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      for (const app of pendingApplications) {
        await handleApplicationAction(
          app,
          action,
          `Bulk ${action} by ${userProfile?.fullName}`,
        );
      }
      setSuccess(
        `Bulk ${action} completed for ${pendingApplications.length} applications!`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(`Failed to complete bulk ${action}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isDemoMode()) {
        disableDemoMode();
        navigate("/");
      } else {
        await signOutUser();
        navigate("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">Department Dashboard</span>
              {isDemoMode() && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-300"
                >
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium">{userProfile?.fullName}</div>
                <div className="text-muted-foreground">
                  {userProfile?.department} Department Officer
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Review and manage no due applications for the{" "}
            {userProfile?.department} department
          </p>
        </div>

        {/* Department Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold">{departmentStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold">
                    {departmentStats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Approved
                  </p>
                  <p className="text-2xl font-bold">
                    {departmentStats.approved}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-info" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg. Processing (days)
                  </p>
                  <p className="text-2xl font-bold">
                    {departmentStats.avgProcessingTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>
                  Review and process no due applications for your department
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("approve")}
                  disabled={loading || departmentStats.pending === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Bulk Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("reject")}
                  disabled={loading || departmentStats.pending === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Bulk Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({departmentStats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({departmentStats.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({departmentStats.rejected})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({departmentStats.total})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {getFilteredApplications().length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      No Applications Found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "No applications match your search criteria"
                        : `No ${activeTab === "all" ? "" : activeTab + " "}applications for your department`}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Submission Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredApplications().map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {app.studentName}
                          </TableCell>
                          <TableCell>{app.rollNumber}</TableCell>
                          <TableCell>{app.department}</TableCell>
                          <TableCell>{app.submissionDate}</TableCell>
                          <TableCell>
                            {getStatusBadge(
                              app.progress[
                                userDepartment as keyof typeof app.progress
                              ],
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Application Details
                                    </DialogTitle>
                                    <DialogDescription>
                                      Review application information and take
                                      action
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-medium">
                                          Student Name
                                        </Label>
                                        <p>{app.studentName}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">
                                          Roll Number
                                        </Label>
                                        <p>{app.rollNumber}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">
                                          Email
                                        </Label>
                                        <p>{app.email}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">
                                          Department
                                        </Label>
                                        <p>{app.department}</p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">
                                          Course
                                        </Label>
                                        <p>
                                          {app.course} - {app.year}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">
                                          Submission Date
                                        </Label>
                                        <p>{app.submissionDate}</p>
                                      </div>
                                    </div>
                                    {app.reason && (
                                      <div>
                                        <Label className="font-medium">
                                          Application Reason
                                        </Label>
                                        <p className="text-muted-foreground">
                                          {app.reason}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <Label className="font-medium">
                                        Department Progress
                                      </Label>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        {Object.entries(app.progress).map(
                                          ([dept, status]) => (
                                            <div
                                              key={dept}
                                              className="flex items-center justify-between p-2 border rounded"
                                            >
                                              <span className="text-sm capitalize">
                                                {dept === "lab"
                                                  ? "Lab/Department"
                                                  : dept}
                                              </span>
                                              {getStatusBadge(status)}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                    {app.progress[
                                      userDepartment as keyof typeof app.progress
                                    ] === "pending" && (
                                      <div className="flex space-x-2 pt-4">
                                        <Button
                                          onClick={() =>
                                            openActionDialog(app, "approve")
                                          }
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            openActionDialog(app, "reject")
                                          }
                                          variant="destructive"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {app.progress[
                                userDepartment as keyof typeof app.progress
                              ] === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openActionDialog(app, "approve")
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      openActionDialog(app, "reject")
                                    }
                                    variant="destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve" : "Reject"} Application
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "Confirm approval for this no due application"
                  : "Provide reason for rejecting this application"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedApplication && (
                <div className="space-y-2">
                  <p>
                    <strong>Student:</strong> {selectedApplication.studentName}
                  </p>
                  <p>
                    <strong>Roll Number:</strong>{" "}
                    {selectedApplication.rollNumber}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedApplication.department}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {actionType === "approve"
                    ? "Comments (Optional)"
                    : "Reason for Rejection *"}
                </Label>
                <Textarea
                  id="comments"
                  placeholder={
                    actionType === "approve"
                      ? "Add any comments about the approval..."
                      : "Please provide a clear reason for rejection..."
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required={actionType === "reject"}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    if (selectedApplication && actionType) {
                      handleApplicationAction(
                        selectedApplication,
                        actionType,
                        comments,
                      );
                    }
                  }}
                  disabled={
                    loading || (actionType === "reject" && !comments.trim())
                  }
                  className={
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                  variant={actionType === "reject" ? "destructive" : "default"}
                >
                  {loading
                    ? "Processing..."
                    : actionType === "approve"
                      ? "Approve Application"
                      : "Reject Application"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedApplication(null);
                    setComments("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
