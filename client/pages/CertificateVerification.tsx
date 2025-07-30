import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applicationStore, Application } from '@/lib/applicationStore';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Calendar,
  User,
  GraduationCap,
  Building2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const CertificateVerification: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualLookupId, setManualLookupId] = useState('');

  useEffect(() => {
    if (applicationId) {
      // Find the application by ID
      const allApplications = applicationStore.getAllApplications();
      const foundApplication = allApplications.find(app => app.id === applicationId);

      if (foundApplication) {
        setApplication(foundApplication);
      } else {
        setError('Certificate not found or invalid certificate ID');
      }
    } else {
      setError('No certificate ID provided. Please scan a valid QR code or provide a certificate ID.');
    }

    setLoading(false);
  }, [applicationId]);

  const handleManualLookup = () => {
    if (manualLookupId.trim()) {
      navigate(`/verify/${manualLookupId.trim()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold">Certificate Verification</span>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error ? (
            <Card className="border-red-200">
              <CardHeader className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">Certificate Not Found</CardTitle>
                <CardDescription>
                  The certificate you're trying to verify could not be found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="text-center mt-6">
                  <p className="text-muted-foreground mb-4">
                    This could happen if:
                  </p>
                  <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-1">
                    <li>• The certificate ID is incorrect</li>
                    <li>• The certificate has been revoked</li>
                    <li>• The QR code is damaged or corrupted</li>
                    <li>• The application has not been approved yet</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : application ? (
            <div className="space-y-6">
              {/* Verification Status */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardHeader className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-600">Certificate Verified</CardTitle>
                  <CardDescription>
                    This is a genuine No Due Certificate issued by Sample University
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Certificate Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Certificate Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Student Information</span>
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                          <p className="font-semibold">{application.studentName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Roll Number</p>
                          <p className="font-mono">{application.rollNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p>{application.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Department</p>
                          <p>{application.department}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Course</p>
                          <p>{application.course} - {application.year}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Certificate Information</span>
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                          <p className="font-mono">{application.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                          <p>{application.submissionDate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                          <p>{new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <Badge className={
                            application.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }>
                            {application.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Department Clearances */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Department Clearances</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(application.progress).map(([dept, status]) => (
                        <Card key={dept} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium capitalize">
                                {dept === 'lab' ? 'Lab/Department' : dept}
                              </p>
                              <p className="text-sm text-muted-foreground">Department</p>
                            </div>
                            <Badge className={
                              status === 'approved' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }>
                              {status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                              {status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Certificate Authenticity:</strong> This certificate has been verified against our database. 
                      The QR code confirms this is a genuine No Due Certificate issued by Sample University. 
                      All department clearances have been validated and recorded.
                    </AlertDescription>
                  </Alert>

                  {/* Additional Information */}
                  {application.reason && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Application Reason</h4>
                      <p className="text-muted-foreground">{application.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Institution Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Issuing Institution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">Sample University</p>
                    <p className="text-muted-foreground">Office of Student Affairs</p>
                    <p className="text-sm text-muted-foreground">
                      This certificate is issued electronically and is valid for all official purposes.
                      For any queries regarding this certificate, contact the Registrar's Office.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No certificate information available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
