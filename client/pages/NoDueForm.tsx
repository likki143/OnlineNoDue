import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { applicationStore } from '@/lib/applicationStore';
import { 
  GraduationCap, 
  ArrowLeft, 
  Upload,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Calendar,
  Save
} from 'lucide-react';

const NoDueForm: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canApply, setCanApply] = useState(true);

  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    rollNumber: userProfile?.rollNumber || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
    department: userProfile?.department || '',
    year: '',
    course: '',
    collegeName: '',
    idCardFile: null as File | null,
    documentsFile: null as File | null,
    reason: ''
  });

  const departments = [
    'Library',
    'Hostel',
    'Accounts',
    'Lab / Department',
    'Sports'
  ];

  useEffect(() => {
    if (userProfile?.uid) {
      const canStudentApply = applicationStore.canStudentApply(userProfile.uid);
      setCanApply(canStudentApply);

      if (!canStudentApply) {
        setError('You have already submitted an application. Only one application per student is allowed.');
      }
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      [fieldName]: file
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Validate required fields
      if (!formData.year || !formData.course) {
        throw new Error('Please fill in all required fields');
      }

      // Submit application to store
      const application = applicationStore.submitApplication({
        studentId: userProfile.uid,
        studentName: formData.fullName,
        rollNumber: formData.rollNumber,
        email: formData.email,
        department: formData.department,
        course: formData.course,
        year: formData.year,
        reason: formData.reason,
        collegeName: formData.collegeName,
        documents: {
          idCard: formData.idCardFile?.name,
          supportingDocs: formData.documentsFile?.name
        }
      });

      console.log('Application submitted:', application);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-green-600">Application Submitted Successfully!</CardTitle>
              <CardDescription>
                Your no due application has been submitted and is now under review
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You will receive notifications as departments review your application
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/student/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/student/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold">No Due Application Form</span>
              </div>
            </div>
            <Badge variant="outline">New Application</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Student No Due Form</CardTitle>
              <CardDescription>
                Fill out all required information for your no due clearance application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!canApply && (
                <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You have already submitted an application. Only one application per student is allowed.
                    Please check your dashboard to track your existing application status.
                  </AlertDescription>
                </Alert>
              )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number / Student ID *</Label>
                      <Input
                        id="rollNumber"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email ID *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Academic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Branch / Department *</Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Year / Semester *</Label>
                      <Select onValueChange={(value) => handleSelectChange('year', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                          <SelectItem value="Final Year">Final Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Course *</Label>
                      <Select onValueChange={(value) => handleSelectChange('course', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B.Tech">B.Tech</SelectItem>
                          <SelectItem value="M.Tech">M.Tech</SelectItem>
                          <SelectItem value="MBA">MBA</SelectItem>
                          <SelectItem value="MCA">MCA</SelectItem>
                          <SelectItem value="B.Sc">B.Sc</SelectItem>
                          <SelectItem value="M.Sc">M.Sc</SelectItem>
                          <SelectItem value="PhD">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name (Optional)</Label>
                    <Input
                      id="collegeName"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      placeholder="Enter your college name"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Document Upload</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="idCard">Upload ID Card / Admit Card (Optional)</Label>
                      <Input
                        id="idCard"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, 'idCardFile')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documents">Upload Supporting Documents (Optional)</Label>
                      <Input
                        id="documents"
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={(e) => handleFileChange(e, 'documentsFile')}
                      />
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Application Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for No Due Certificate (Optional)</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Enter the reason for requesting no due certificate (e.g., graduation, course completion, etc.)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Department Status Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Department Clearance Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                      <Card key={dept} className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dept}</span>
                          <Badge variant="outline" className="status-pending">
                            Pending
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Status will be updated as departments review your application
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/student/dashboard')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || !canApply}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : !canApply ? (
                      <>
                        Application Already Submitted
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NoDueForm;
