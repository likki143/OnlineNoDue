import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, ExternalLink } from 'lucide-react';

const AdminInstructions: React.FC = () => {
  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>First time admin?</strong> Create the admin account first using the setup page.
        </div>
        <Link to="/admin/setup">
          <Button size="sm" variant="outline" className="ml-4 text-blue-600 border-blue-300 hover:bg-blue-100">
            Setup Admin
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
};

export default AdminInstructions;
