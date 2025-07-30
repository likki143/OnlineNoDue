import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInUser, resetPassword } from '@/lib/auth';
import { testFirebaseConnection } from '@/lib/firebase';
import { demoSignIn, isDemoMode, enableDemoMode } from '@/lib/demo-auth';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [demoMode, setDemoMode] = useState(isDemoMode());

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent, retryCount = 0) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData.email);

      // Test Firebase connection first if this is the first attempt
      if (retryCount === 0) {
        const connectionTest = await testFirebaseConnection();
        if (!connectionTest) {
          throw new Error('Unable to connect to Firebase services. Please check your internet connection.');
        }
      }

      const { user, profile } = await signInUser(formData.email, formData.password);
      console.log('Login successful:', { user: user.uid, profile: profile.role });

      // Redirect based on role
      switch (profile.role) {
        case 'student':
          console.log('Redirecting to student dashboard');
          navigate('/student/dashboard');
          break;
        case 'department_officer':
          console.log('Redirecting to department dashboard');
          navigate('/department/dashboard');
          break;
        case 'admin':
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        default:
          console.log('Unknown role, redirecting to home');
          navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Retry once for network errors
      if (err.message?.includes('network') && retryCount === 0) {
        console.log('Network error detected, retrying...');
        setError('Network issue detected. Retrying...');
        setTimeout(() => {
          handleLogin(e, 1);
        }, 2000);
        return;
      }

      // If Firebase is completely unavailable or invalid credentials, suggest demo mode
      if (err.message?.includes('network') ||
          err.message?.includes('Firebase') ||
          err.message?.includes('invalid-credential') ||
          err.message?.includes('user-not-found')) {
        setError(err.message + ' | Try demo mode below if you need to test the application.');
        setLoading(false);
        return;
      }

      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to login';

      if (errorMessage.includes('user-not-found')) {
        errorMessage = 'No account found with this email address';
      } else if (errorMessage.includes('wrong-password')) {
        errorMessage = 'Incorrect password';
      } else if (errorMessage.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (errorMessage.includes('email') && !errorMessage.includes('network')) {
        errorMessage = 'Please verify your email before logging in';
      }

      setError(errorMessage);
      setLoading(false);
    }

    if (retryCount === 0) {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const demoUser = await demoSignIn(formData.email, formData.password);

      if (demoUser) {
        enableDemoMode();
        setDemoMode(true);

        // Navigate based on role
        switch (demoUser.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'department_officer':
            navigate('/department/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(formData.email);
      setSuccess('Password reset email sent! Check your inbox.');
      setResetEmailSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">No Due System</span>
          </div>
          <Badge variant="secondary" className="mb-4">
            Secure Login Portal
          </Badge>
        </div>

        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your account and continue your no due process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="department">Department</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your student email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={handleForgotPassword}
                      disabled={resetEmailSent}
                    >
                      {resetEmailSent ? 'Email Sent!' : 'Forgot Password?'}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In as Student'}
                  </Button>
                </form>

                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Don't have a student account?
                  </div>
                  <Link to="/register">
                    <Button variant="outline" className="w-full">
                      Create Student Account
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="department" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="dept-email">Department Officer Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dept-email"
                        name="email"
                        type="email"
                        placeholder="Enter your department email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dept-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dept-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In as Department Officer'}
                  </Button>
                </form>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    Department Officer credentials are provided by the system administrator
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Administrator Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your admin email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-9 pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={handleForgotPassword}
                      disabled={resetEmailSent}
                    >
                      {resetEmailSent ? 'Email Sent!' : 'Forgot Password?'}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In as Administrator'}
                  </Button>
                </form>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground text-center mb-2">
                    <strong>Administrator Access</strong>
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Only authorized system administrators can access this portal
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Demo Mode Section */}
            {(error?.includes('network') || error?.includes('invalid-credential') || error?.includes('user-not-found')) && (
              <div className="mt-6 border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  {error?.includes('invalid-credential') || error?.includes('user-not-found')
                    ? '🔑 User Not Found in Firebase'
                    : '🚧 Firebase Connection Issue Detected'}
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  {error?.includes('invalid-credential') || error?.includes('user-not-found')
                    ? 'The user account may not exist in Firebase. Use demo mode to test features:'
                    : 'Try demo mode to test the application features:'}
                </p>
                <div className="space-y-2 text-xs text-yellow-600 dark:text-yellow-400">
                  <div><strong>Student:</strong> student@demo.com | Password: demo123</div>
                  <div><strong>Admin:</strong> Admin@nodue.com | Password: Admin@123</div>
                  <div><strong>Department:</strong> dept@demo.com | Password: demo123</div>
                </div>
                <Button
                  onClick={handleDemoLogin}
                  className="w-full mt-3"
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? 'Connecting to Demo...' : 'Try Demo Mode'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Protected by Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
