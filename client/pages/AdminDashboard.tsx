import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser, createDepartmentOfficer } from '@/lib/auth';
import { isDemoMode, disableDemoMode } from '@/lib/demo-auth';
import { applicationStore, Application, Student, DepartmentOfficer, AuditLog } from '@/lib/applicationStore';
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
  QrCode
} from 'lucide-react';

interface NewOfficerForm {
  name: string;
  email: string;
  department: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Real data from application store
  const [applications, setApplications] = useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    inProgressApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalDepartments: 5,
    activeOfficers: 0
  });

  // Officer creation form
  const [showOfficerForm, setShowOfficerForm] = useState(false);
  const [newOfficer, setNewOfficer] = useState<NewOfficerForm>({
    name: '',
    email: '',
    department: '',
    role: ''
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
      navigate('/');
    }
  };

  const handleExportData = (type: 'students' | 'applications' | 'officers') => {
    // In production, this would generate and download actual CSV files
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(`${type} data exported successfully! Download started.`);
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleCreateOfficer = async () => {
    if (!newOfficer.name || !newOfficer.email || !newOfficer.department || !newOfficer.role) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add to application store
      applicationStore.addOfficer({
        name: newOfficer.name,
        email: newOfficer.email,
        department: newOfficer.department,
        role: newOfficer.role
      });

      // In production, you would also create Firebase user here
      // await createDepartmentOfficer(newOfficer.email, 'temp_password', newOfficer.name, newOfficer.department);

      setSuccess(`Department officer "${newOfficer.name}" created successfully!`);
      setNewOfficer({ name: '', email: '', department: '', role: '' });
      setShowOfficerForm(false);
      refreshData(); // Refresh the data

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create department officer');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'in_progress':
        return <Badge className="status-in-progress">In Progress</Badge>;
      case 'pending':
        return <Badge className="status-pending">Pending</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'inactive':
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
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium">{userProfile?.fullName}</div>
                <div className="text-muted-foreground">System Administrator</div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
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
                      <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold">{statistics.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                      <p className="text-2xl font-bold">{statistics.totalApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{statistics.pendingApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">{statistics.approvedApplications}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest no due form submissions</CardDescription>
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
                    {applications.slice(0, 5).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
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
                    ))}
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
                    onClick={() => handleExportData('applications')} 
                    className="w-full" 
                    variant="outline"
                    disabled={loading}
                  >
                    Export Applications (CSV)
                  </Button>
                  <Button 
                    onClick={() => handleExportData('students')} 
                    className="w-full" 
                    variant="outline"
                    disabled={loading}
                  >
                    Export Students (CSV)
                  </Button>
                  <Button 
                    onClick={() => handleExportData('officers')} 
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
                  <Button className="w-full" variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </Button>
                  <Button className="w-full" variant="outline">
                    View Certificate Templates
                  </Button>
                  <Button className="w-full" variant="outline">
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
                <p className="text-muted-foreground">Manage students and department officers</p>
              </div>
              <Button onClick={handleCreateOfficer} disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Department Officer
              </Button>
            </div>

            <Tabs defaultValue="students" className="space-y-4">
              <TabsList>
                <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                <TabsTrigger value="officers">Department Officers ({officers.length})</TabsTrigger>
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
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.rollNumber}</TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>{student.registrationDate}</TableCell>
                            <TableCell>{getStatusBadge(student.status)}</TableCell>
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
                        ))}
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
                        {officers.map((officer) => (
                          <TableRow key={officer.id}>
                            <TableCell className="font-medium">{officer.name}</TableCell>
                            <TableCell>{officer.email}</TableCell>
                            <TableCell>{officer.department}</TableCell>
                            <TableCell>{officer.role}</TableCell>
                            <TableCell>{officer.lastLogin}</TableCell>
                            <TableCell>{getStatusBadge(officer.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
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
                <p className="text-muted-foreground">Configure departments and assign officers</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Library', 'Hostel', 'Accounts', 'Lab / Department', 'Sports'].map((dept) => (
                <Card key={dept}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{dept}</span>
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Assigned Officer</Label>
                      <p className="text-sm text-muted-foreground">
                        {dept === 'Library' ? 'Dr. Alice Brown' : 
                         dept === 'Accounts' ? 'Ms. Emma Davis' : 'Not Assigned'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Pending Applications</Label>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 20) + 5}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Application Management</h2>
                <p className="text-muted-foreground">View and manage all student applications</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Input
                    placeholder="Search applications..."
                    className="max-w-sm"
                  />
                  <Select>
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
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.studentName}</TableCell>
                        <TableCell>{app.rollNumber}</TableCell>
                        <TableCell>{app.department}</TableCell>
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
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
                <p className="text-muted-foreground">Track all system activities and changes</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search logs..." className="max-w-sm" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                      <SelectItem value="rejection">Rejection</SelectItem>
                      <SelectItem value="creation">Creation</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <TableRow>
                      <TableCell>2024-01-28 14:30:22</TableCell>
                      <TableCell>Dr. Alice Brown</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      </TableCell>
                      <TableCell>Application #001</TableCell>
                      <TableCell>Library clearance approved for John Smith</TableCell>
                      <TableCell>192.168.1.45</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-28 14:25:15</TableCell>
                      <TableCell>System Admin</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">Created</Badge>
                      </TableCell>
                      <TableCell>Department Officer</TableCell>
                      <TableCell>New officer account created for Prof. David Lee</TableCell>
                      <TableCell>192.168.1.10</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2024-01-28 14:20:08</TableCell>
                      <TableCell>John Smith</TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>
                      </TableCell>
                      <TableCell>Application #001</TableCell>
                      <TableCell>No due application submitted</TableCell>
                      <TableCell>192.168.1.78</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
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
                        <SelectItem value="default">Default Template</SelectItem>
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
                    <p className="text-sm text-muted-foreground">Save all configuration changes</p>
                  </div>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Changes
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
