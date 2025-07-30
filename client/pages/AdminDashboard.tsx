import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';
import { isDemoMode, disableDemoMode } from '@/lib/demo-auth';
import { 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Shield
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">Admin Dashboard</span>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete system management and oversight
          </p>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Admin Features</span>
            </CardTitle>
            <CardDescription>
              This dashboard will include user management, system configuration, and analytics features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Admin Dashboard Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Complete system administration features will be available here
              </p>
              <Button variant="outline">
                Continue Implementation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
