import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';
import { isDemoMode, disableDemoMode } from '@/lib/demo-auth';
import { applicationStore, Application } from '@/lib/applicationStore';
import { generateCertificatePDF, generateSampleFormsPDF, generateGuidelinesPDF } from '@/lib/utils/pdfGenerator';
import { 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Plus
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [canApply, setCanApply] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'in_progress' | 'approved' | 'rejected'>('none');

  useEffect(() => {
    if (userProfile?.uid) {
      // Load applications for current student
      const studentApplications = applicationStore.getApplicationsByStudentId(userProfile.uid);
      setApplications(studentApplications);

      // Check if student can apply
      const canStudentApply = applicationStore.canStudentApply(userProfile.uid);
      setCanApply(canStudentApply);

      // Get application status
      const status = applicationStore.getStudentApplicationStatus(userProfile.uid);
      setApplicationStatus(status);

      setLoading(false);
    }
  }, [userProfile]);

  const refreshApplications = () => {
    if (userProfile?.uid) {
      const studentApplications = applicationStore.getApplicationsByStudentId(userProfile.uid);
      setApplications(studentApplications);

      // Update application eligibility and status
      const canStudentApply = applicationStore.canStudentApply(userProfile.uid);
      setCanApply(canStudentApply);

      const status = applicationStore.getStudentApplicationStatus(userProfile.uid);
      setApplicationStatus(status);
    }
  };

  const handleDownloadForms = () => {
    try {
      generateSampleFormsPDF();
    } catch (error) {
      alert('Failed to generate forms PDF. Please try again.');
    }
  };

  const handleContactSupport = () => {
    // In a real implementation, this would open a support ticket system
    const supportEmail = 'support@university.edu';
    const subject = 'No Due System Support Request';
    const body = `Dear Support Team,

I need assistance with the No Due System.

Student Details:
- Name: ${userProfile?.fullName}
- Roll Number: ${userProfile?.rollNumber}
- Email: ${userProfile?.email}

Issue Description:
[Please describe your issue here]

Thank you for your assistance.

Best regards,
${userProfile?.fullName}`;

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleViewGuidelines = () => {
    try {
      generateGuidelinesPDF();
    } catch (error) {
      alert('Failed to generate guidelines PDF. Please try again.');
    }
  };

  const handleDownloadCertificate = async (application: Application) => {
    try {
      await generateCertificatePDF(application);
    } catch (error) {
      alert('Failed to generate certificate PDF. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      if (isDemoMode()) {
        disableDemoMode();
        navigate('/');
      } else {
        await signOutUser();
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, redirect to home
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold">Student Dashboard</span>
              {isDemoMode() && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium">{userProfile?.fullName}</div>
                <div className="text-muted-foreground">{userProfile?.rollNumber}</div>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.fullName}!</h1>
          <p className="text-muted-foreground">
            Track your no due applications and manage your clearance process
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Applications</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Rejected</p>
                  <p className="text-2xl font-bold">
                    {applications.filter(app => app.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>
                      Track the status of your no due form submissions
                    </CardDescription>
                  </div>
                  {canApply ? (
                    <Link to="/student/apply">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Application
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Application Submitted
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Applications Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Submit your first no due form to get started with the clearance process
                    </p>
                    {canApply ? (
                      <Link to="/student/apply">
                        <Button>Submit New Application</Button>
                      </Link>
                    ) : (
                      <Button disabled>
                        Only One Application Allowed
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application ID</TableHead>
                          <TableHead>Submission Date</TableHead>
                          <TableHead>Department Progress</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell className="font-mono">#{app.id}</TableCell>
                            <TableCell>{app.submissionDate}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {Object.entries(app.progress).map(([dept, status]) => (
                                  <div
                                    key={dept}
                                    className={`w-3 h-3 rounded-full ${
                                      status === 'approved' ? 'bg-green-500' :
                                      status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}
                                    title={`${dept}: ${status}`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                app.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                app.status === 'in_progress' ? 'status-in-progress' : 'status-pending'
                              }>
                                {app.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex justify-center pt-4">
                      <Button onClick={refreshApplications} variant="outline">
                        Refresh Applications
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-muted-foreground">{userProfile?.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{userProfile?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-muted-foreground">{userProfile?.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email Status</p>
                  {userProfile?.emailVerified || isDemoMode() ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" onClick={handleDownloadForms}>
                  Download Forms
                </Button>
                <Button className="w-full" variant="outline" onClick={handleContactSupport}>
                  Contact Support
                </Button>
                <Button className="w-full" variant="outline" onClick={handleViewGuidelines}>
                  View Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
