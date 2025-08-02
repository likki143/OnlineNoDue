import React, { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser, createDepartmentOfficer } from "@/lib/auth";
import { isDemoMode, disableDemoMode } from "@/lib/demo-auth";
import {
  applicationStore,
  Application,
  Student,
  DepartmentOfficer,
  AuditLog,
} from "@/lib/applicationStore";
import { firebaseApplicationService } from "@/lib/firebaseApplicationService";
import {
  exportApplicationsCSV,
  exportStudentsCSV,
  exportOfficersCSV,
  exportAuditLogsCSV,
  filterApplicationsByStatus,
  searchApplications,
  filterAuditLogsByAction,
  searchAuditLogs,
} from "@/lib/utils/dataExport";
import { generateCertificatePDF } from "@/lib/utils/pdfGenerator";
import {
  sendDepartmentOfficerSetupEmail,
  getSentEmails,
} from "@/lib/utils/emailService";
import { settingsStore, SystemSettings } from "@/lib/settingsStore";
import {
  Shield,
  Users,
  Building2,
  FileText,
  Download,
  Settings,
  BarChart3,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  Key,
  Activity,
  Calendar,
  TrendingUp,
  Award,
  QrCode,
  RefreshCw,
} from "lucide-react";

interface NewOfficerForm {
  name: string;
  email: string;
  department: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [auditLogFilter, setAuditLogFilter] = useState("all");
  const [applicationSearchTerm, setApplicationSearchTerm] = useState("");
  const [auditSearchTerm, setAuditSearchTerm] = useState("");

  // Department management states
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentOfficer | null>(null);
  const [showConfigureModal, setShowConfigureModal] = useState(false);

  // Settings states - initialize from settings store
  const [settings, setSettings] = useState<SystemSettings>(
    settingsStore.getSettings(),
  );

  // Real data from application store
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalDepartments: 5,
    activeOfficers: 0,
  });

  // Officer creation form
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [newOfficer, setNewOfficer] = useState<NewOfficerForm>({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  // Load data on component mount and tab change
  React.useEffect(() => {
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    const apps = applicationStore.getAllApplications();
    const studs = applicationStore.getAllStudents();
    const offs = applicationStore.getAllOfficers();
    const logs = applicationStore.getAllAuditLogs();
    const stats = applicationStore.getStatistics();

    setApplications(apps);
    setStudents(studs);
    setOfficers(offs);
    setAuditLogs(logs);
    setStatistics(stats);
    setSentEmails(getSentEmails());
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

  const handleExportData = (type: "students" | "applications" | "officers") => {
    setLoading(true);

    try {
      switch (type) {
        case "applications":
          exportApplicationsCSV(applications);
          break;
        case "students":
          exportStudentsCSV(students);
          break;
        case "officers":
          exportOfficersCSV(officers);
          break;
      }

      setSuccess(`${type} data exported successfully! Download started.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(`Failed to export ${type} data`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOfficer = async (officer: DepartmentOfficer) => {
    const confirmMessage = `Are you sure you want to delete the department officer "${officer.name}" from ${officer.department} department?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    setError("");

    try {
      const deleted = applicationStore.deleteOfficer(officer.id);

      if (deleted) {
        setSuccess(
          `Department officer "${officer.name}" deleted successfully!`,
        );
        refreshData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("Officer not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete department officer");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfficer = async () => {
    if (
      !newOfficer.name ||
      !newOfficer.email ||
      !newOfficer.department ||
      !newOfficer.role
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send setup email first
      const emailResult = await sendDepartmentOfficerSetupEmail({
        name: newOfficer.name,
        email: newOfficer.email,
        department: newOfficer.department,
        role: newOfficer.role,
      });

      if (!emailResult.success) {
        throw new Error(emailResult.error || "Failed to send setup email");
      }

      // Create Firebase user with temporary password
      await createDepartmentOfficer(
        newOfficer.email,
        emailResult.temporaryPassword,
        newOfficer.name,
        newOfficer.department,
      );

      // Add to application store with email info
      const createdOfficer = applicationStore.addOfficer({
        name: newOfficer.name,
        email: newOfficer.email,
        department: newOfficer.department,
        role: newOfficer.role,
        temporaryPassword: emailResult.temporaryPassword,
        emailSent: true,
        passwordSetupRequired: true,
      });

      setSuccess(
        `Department officer "${newOfficer.name}" created successfully! Setup email sent to ${newOfficer.email}`,
      );
      setNewOfficer({ name: "", email: "", department: "", role: "" });
      setShowOfficerForm(false);
      refreshData(); // Refresh the data

      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to create department officer");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    // For demo purposes, generate certificate for first approved application
    const approvedApp = applications.find((app) => app.status === "approved");

    if (!approvedApp) {
      setError("No approved applications found for certificate generation");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      await generateCertificatePDF(approvedApp);
      setSuccess("Certificate generated and downloaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to generate certificate");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCertificateGeneration = async () => {
    const approvedApps = applications.filter(
      (app) => app.status === "approved",
    );

    if (approvedApps.length === 0) {
      setError(
        "No approved applications found for bulk certificate generation",
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      // Generate certificates one by one with a small delay to prevent browser blocking
      for (const app of approvedApps) {
        await generateCertificatePDF(app);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      setSuccess(
        `${approvedApps.length} certificates generated and downloaded successfully!`,
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to generate bulk certificates");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get filtered applications
  const getFilteredApplications = () => {
    let filtered = filterApplicationsByStatus(applications, applicationFilter);
    filtered = searchApplications(filtered, applicationSearchTerm);
    return filtered;
  };

  // Get filtered audit logs
  const getFilteredAuditLogs = () => {
    let filtered = filterAuditLogsByAction(auditLogs, auditLogFilter);
    filtered = searchAuditLogs(filtered, auditSearchTerm);
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "in_progress":
        return <Badge className="status-in-progress">In Progress</Badge>;
      case "pending":
        return <Badge className="status-pending">Pending</Badge>;
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        );
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
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
              <span className="font-bold">Admin Dashboard</span>
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
                  System Administrator
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Students
                      </p>
                      <p className="text-2xl font-bold">
                        {statistics.totalStudents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold">
                        {statistics.totalApplications}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Pending
                      </p>
                      <p className="text-2xl font-bold">
                        {statistics.pendingApplications}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Approved
                      </p>
                      <p className="text-2xl font-bold">
                        {statistics.approvedApplications}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Latest no due form submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No applications submitted yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.slice(0, 5).map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {app.studentName}
                          </TableCell>
                          <TableCell>{app.rollNumber}</TableCell>
                          <TableCell>{app.department}</TableCell>
                          <TableCell>{app.submissionDate}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Export Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => handleExportData("applications")}
                    className="w-full"
                    variant="outline"
                    disabled={loading}
                  >
                    Export Applications (CSV)
                  </Button>
                  <Button
                    onClick={() => handleExportData("students")}
                    className="w-full"
                    variant="outline"
                    disabled={loading}
                  >
                    Export Students (CSV)
                  </Button>
                  <Button
                    onClick={() => handleExportData("officers")}
                    className="w-full"
                    variant="outline"
                    disabled={loading}
                  >
                    Export Officers (CSV)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Certificates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleGenerateCertificate}
                    disabled={loading}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Certificate Templates
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleBulkCertificateGeneration}
                    disabled={loading}
                  >
                    Bulk Certificate Generation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Approval Rate</span>
                      <span className="font-semibold">84%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Processing Time</span>
                      <span className="font-semibold">3.2 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Department Efficiency</span>
                      <span className="font-semibold">91%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">
                  Manage students and department officers
                </p>
              </div>
              <Button
                onClick={() => setShowOfficerForm(true)}
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Department Officer
              </Button>
            </div>

            {/* Department Configuration Modal */}
            {showConfigureModal && selectedDepartment && (
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle>
                    Configure {selectedDepartment.department} Department
                  </CardTitle>
                  <CardDescription>
                    Manage department settings and officer permissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Department Officer</Label>
                      <Input value={selectedDepartment.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department Email</Label>
                      <Input value={selectedDepartment.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Auto-Approval Threshold (days)</Label>
                      <Input type="number" defaultValue="7" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Processing Time (days)</Label>
                      <Input type="number" defaultValue="15" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Department Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Can approve applications
                        </Label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Can reject applications
                        </Label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Receive email notifications
                        </Label>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          Can bulk process applications
                        </Label>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setSuccess(
                          `${selectedDepartment.department} department configured successfully!`,
                        );
                        setShowConfigureModal(false);
                        setTimeout(() => setSuccess(""), 3000);
                      }}
                    >
                      Save Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowConfigureModal(false);
                        setSelectedDepartment(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Officer Creation Form */}
            {showOfficerForm && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Create New Department Officer</CardTitle>
                  <CardDescription>
                    Add a new department officer account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="officerName">Full Name *</Label>
                      <Input
                        id="officerName"
                        value={newOfficer.name}
                        onChange={(e) =>
                          setNewOfficer({ ...newOfficer, name: e.target.value })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officerEmail">Email *</Label>
                      <Input
                        id="officerEmail"
                        type="email"
                        value={newOfficer.email}
                        onChange={(e) =>
                          setNewOfficer({
                            ...newOfficer,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select
                        onValueChange={(value) =>
                          setNewOfficer({ ...newOfficer, department: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Library">Library</SelectItem>
                          <SelectItem value="Hostel">Hostel</SelectItem>
                          <SelectItem value="Accounts">Accounts</SelectItem>
                          <SelectItem value="Lab">Lab / Department</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officerRole">Role *</Label>
                      <Input
                        id="officerRole"
                        value={newOfficer.role}
                        onChange={(e) =>
                          setNewOfficer({ ...newOfficer, role: e.target.value })
                        }
                        placeholder="e.g., Head Librarian, HOD"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateOfficer} disabled={loading}>
                      {loading ? "Creating..." : "Create Officer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowOfficerForm(false);
                        setNewOfficer({
                          name: "",
                          email: "",
                          department: "",
                          role: "",
                        });
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="students" className="space-y-4">
              <TabsList>
                <TabsTrigger value="students">
                  Students ({students.length})
                </TabsTrigger>
                <TabsTrigger value="officers">
                  Department Officers ({officers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Students</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64"
                        />
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Roll Number</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Registration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No students registered yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          students.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.name}
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.rollNumber}</TableCell>
                              <TableCell>{student.department}</TableCell>
                              <TableCell>{student.registrationDate}</TableCell>
                              <TableCell>
                                {getStatusBadge(student.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="officers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Department Officers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {officers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No department officers created yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          officers.map((officer) => (
                            <TableRow key={officer.id}>
                              <TableCell className="font-medium">
                                {officer.name}
                              </TableCell>
                              <TableCell>{officer.email}</TableCell>
                              <TableCell>{officer.department}</TableCell>
                              <TableCell>{officer.role}</TableCell>
                              <TableCell>
                                {officer.lastLogin || "Never"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  {getStatusBadge(officer.status)}
                                  {officer.emailSent && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      Email Sent
                                    </Badge>
                                  )}
                                  {officer.passwordSetupRequired && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Setup Required
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (officer.temporaryPassword) {
                                        alert(
                                          `Temporary Password: ${officer.temporaryPassword}\n\nNote: This password should be changed on first login.`,
                                        );
                                      } else {
                                        alert(
                                          "No temporary password available.",
                                        );
                                      }
                                    }}
                                    title="View temporary password"
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteOfficer(officer)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={loading}
                                    title="Delete officer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Department Management</h2>
                <p className="text-muted-foreground">
                  Configure departments and assign officers
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {officers.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    No Departments with Officers
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create department officers to see departments here
                  </p>
                  <Button onClick={() => setShowOfficerForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Officer
                  </Button>
                </div>
              ) : (
                officers.map((officer) => (
                  <Card key={officer.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{officer.department}</span>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Assigned Officer
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {officer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {officer.role}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Pending Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {
                            applications.filter(
                              (app) =>
                                app.progress[
                                  officer.department.toLowerCase() as keyof typeof app.progress
                                ] === "pending",
                            ).length
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Officer Status
                        </Label>
                        <div className="mt-1">
                          {getStatusBadge(officer.status)}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedDepartment(officer);
                            setShowConfigureModal(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            alert(
                              `Edit Department Officer:\n\nName: ${officer.name}\nEmail: ${officer.email}\nDepartment: ${officer.department}\nRole: ${officer.role}\n\nNote: Full edit functionality would be implemented here.`,
                            );
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Application Management</h2>
                <p className="text-muted-foreground">
                  View and manage all student applications
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    exportApplicationsCSV(getFilteredApplications())
                  }
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter: {applicationFilter}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search applications..."
                    className="max-w-sm"
                    value={applicationSearchTerm}
                    onChange={(e) => setApplicationSearchTerm(e.target.value)}
                  />
                  <Select
                    value={applicationFilter}
                    onValueChange={setApplicationFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setApplicationSearchTerm("");
                      setApplicationFilter("all");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Submission</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredApps = getFilteredApplications();
                      return filteredApps.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-muted-foreground"
                          >
                            {applications.length === 0
                              ? "No applications submitted yet"
                              : "No applications match your search criteria"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApps.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-medium">
                              {app.studentName}
                            </TableCell>
                            <TableCell>{app.rollNumber}</TableCell>
                            <TableCell>{app.department}</TableCell>
                            <TableCell>{app.submissionDate}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {Object.entries(app.progress).map(
                                  ([dept, status]) => (
                                    <div
                                      key={dept}
                                      className={`w-3 h-3 rounded-full ${
                                        status === "approved"
                                          ? "bg-green-500"
                                          : status === "rejected"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                      }`}
                                      title={`${dept}: ${status}`}
                                    />
                                  ),
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    alert(
                                      `Viewing Application #${app.id}\n\nStudent: ${app.studentName}\nRoll Number: ${app.rollNumber}\nDepartment: ${app.department}\nStatus: ${app.status}\nSubmission Date: ${app.submissionDate}\n\nDepartment Progress:\n- Library: ${app.progress.library}\n- Hostel: ${app.progress.hostel}\n- Accounts: ${app.progress.accounts}\n- Lab: ${app.progress.lab}\n- Sports: ${app.progress.sports}`,
                                    );
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Override status for Application #${app.id}?\n\nThis will mark all departments as approved.`,
                                      )
                                    ) {
                                      applicationStore.updateApplicationStatus(
                                        app.id,
                                        {
                                          library: "approved",
                                          hostel: "approved",
                                          accounts: "approved",
                                          lab: "approved",
                                          sports: "approved",
                                        },
                                      );
                                      refreshData();
                                      setSuccess(
                                        "Application status overridden successfully!",
                                      );
                                      setTimeout(() => setSuccess(""), 3000);
                                    }
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      );
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Email Notifications</h2>
                <p className="text-muted-foreground">
                  View all system-generated email notifications
                </p>
              </div>
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Email Notifications</CardTitle>
                <CardDescription>
                  System-generated emails sent to students and officers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentEmails.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No email notifications sent yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      sentEmails.slice(0, 50).map((email) => (
                        <TableRow key={email.id}>
                          <TableCell>
                            {new Date(email.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{email.to}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {email.subject}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                email.subject.includes("Setup")
                                  ? "bg-blue-100 text-blue-800"
                                  : email.subject.includes("Approved")
                                    ? "bg-green-100 text-green-800"
                                    : email.subject.includes("Rejected")
                                      ? "bg-red-100 text-red-800"
                                      : email.subject.includes("Certificate")
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                              }
                            >
                              {email.subject.includes("Setup")
                                ? "Officer Setup"
                                : email.subject.includes("Approved")
                                  ? "Application Approved"
                                  : email.subject.includes("Rejected")
                                    ? "Application Rejected"
                                    : email.subject.includes("Certificate")
                                      ? "Certificate Ready"
                                      : "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                alert(
                                  `Email Details:\n\nTo: ${email.to}\nSubject: ${email.subject}\nSent: ${new Date(email.timestamp).toLocaleString()}\n\nContent:\n${email.textContent.substring(0, 500)}...`,
                                );
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Audit Trail</h2>
                <p className="text-muted-foreground">
                  Track all system activities and changes
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => exportAuditLogsCSV(getFilteredAuditLogs())}
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search logs..."
                    className="max-w-sm"
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                  />
                  <Select
                    value={auditLogFilter}
                    onValueChange={setAuditLogFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="officer">Officer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAuditSearchTerm("");
                      setAuditLogFilter("all");
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredLogs = getFilteredAuditLogs();
                      return filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            {auditLogs.length === 0
                              ? "No audit logs available yet"
                              : "No logs match your search criteria"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.slice(0, 20).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>{log.userName}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  log.action.includes("Approved")
                                    ? "bg-green-100 text-green-800"
                                    : log.action.includes("Created")
                                      ? "bg-blue-100 text-blue-800"
                                      : log.action.includes("Submitted")
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }
                              >
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.target}</TableCell>
                            <TableCell>{log.details}</TableCell>
                            <TableCell>{log.ipAddress}</TableCell>
                          </TableRow>
                        ))
                      );
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input defaultValue="Sample University" />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="2023-2024" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Application Deadline</Label>
                    <Input type="number" defaultValue="30" placeholder="Days" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>SMS Notifications</Label>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-approval Alerts</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Force Password Reset</Label>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Two-Factor Authentication</Label>
                    <input type="checkbox" className="rounded" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificate Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certificate Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Default Template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">
                          Default Template
                        </SelectItem>
                        <SelectItem value="formal">Formal Template</SelectItem>
                        <SelectItem value="modern">Modern Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Include QR Code</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Digital Signature</Label>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Save Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Save all configuration changes
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setLoading(true);
                      try {
                        // Save settings to store
                        const updatedSettings =
                          settingsStore.updateSettings(settings);
                        setSettings(updatedSettings);
                        setSuccess(
                          "Settings saved successfully! Changes will apply to new certificates.",
                        );
                        setTimeout(() => setSuccess(""), 4000);
                      } catch (error) {
                        setError("Failed to save settings. Please try again.");
                        setTimeout(() => setError(""), 3000);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
