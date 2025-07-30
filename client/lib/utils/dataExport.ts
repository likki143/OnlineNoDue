// Utility functions for data export and file downloads

import { Application, Student, DepartmentOfficer, AuditLog } from '../applicationStore';

// Convert data to CSV format
export const convertToCSV = (data: any[], headers: string[]): string => {
  if (data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Export applications to CSV
export const exportApplicationsCSV = (applications: Application[]): void => {
  const headers = [
    'id', 'studentName', 'rollNumber', 'email', 'department', 'course', 
    'year', 'submissionDate', 'status', 'library', 'hostel', 'accounts', 
    'lab', 'sports', 'reason', 'collegeName'
  ];
  
  const exportData = applications.map(app => ({
    id: app.id,
    studentName: app.studentName,
    rollNumber: app.rollNumber,
    email: app.email,
    department: app.department,
    course: app.course,
    year: app.year,
    submissionDate: app.submissionDate,
    status: app.status,
    library: app.progress.library,
    hostel: app.progress.hostel,
    accounts: app.progress.accounts,
    lab: app.progress.lab,
    sports: app.progress.sports,
    reason: app.reason || '',
    collegeName: app.collegeName || ''
  }));
  
  const csvContent = convertToCSV(exportData, headers);
  const filename = `applications_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export students to CSV
export const exportStudentsCSV = (students: Student[]): void => {
  const headers = [
    'id', 'name', 'email', 'rollNumber', 'department', 'course', 
    'phone', 'registrationDate', 'emailVerified', 'status'
  ];
  
  const csvContent = convertToCSV(students, headers);
  const filename = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export officers to CSV
export const exportOfficersCSV = (officers: DepartmentOfficer[]): void => {
  const headers = [
    'id', 'name', 'email', 'department', 'role', 'createdDate', 
    'lastLogin', 'status'
  ];
  
  const csvContent = convertToCSV(officers, headers);
  const filename = `officers_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Export audit logs to CSV
export const exportAuditLogsCSV = (logs: AuditLog[]): void => {
  const headers = [
    'id', 'timestamp', 'userId', 'userName', 'action', 'target', 
    'details', 'ipAddress'
  ];
  
  const csvContent = convertToCSV(logs, headers);
  const filename = `audit_logs_export_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
};

// Generate No Due Certificate (PDF simulation)
export const generateCertificate = (applicationId: string, studentName: string): void => {
  // In a real implementation, this would generate an actual PDF
  // For now, we'll create a simple text file as a placeholder
  
  const certificateContent = `
NO DUE CERTIFICATE
==================

This is to certify that ${studentName} has completed all the clearance requirements 
and has no pending dues with the institution.

Application ID: ${applicationId}
Generated on: ${new Date().toLocaleDateString()}
QR Code: [QR_CODE_PLACEHOLDER_${applicationId}]

This certificate is digitally generated and valid.

Institution Seal: [DIGITAL_SEAL]
  `;
  
  const blob = new Blob([certificateContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `no_due_certificate_${applicationId}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Download sample forms
export const downloadSampleForms = (): void => {
  const formsContent = `
NO DUE APPLICATION FORM - SAMPLE
================================

Student Information:
- Full Name: [Student Name]
- Roll Number: [Student ID]
- Email: [Email Address]
- Phone: [Phone Number]
- Department: [Department Name]
- Course: [Course Name]
- Year/Semester: [Academic Year]

Required Documents:
1. ID Card (Scanned Copy)
2. Fee Receipt (Latest)
3. Library Card
4. Hostel Documents (if applicable)

Departments for Clearance:
□ Library
□ Hostel
□ Accounts
□ Lab/Department
□ Sports

Instructions:
1. Fill all required fields
2. Upload necessary documents
3. Submit the form online
4. Track status through dashboard
5. Download certificate once approved

For support: Contact your department officer or system administrator.
  `;
  
  const blob = new Blob([formsContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'no_due_form_sample.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Filter applications by status
export const filterApplicationsByStatus = (applications: Application[], status: string): Application[] => {
  if (status === 'all') return applications;
  return applications.filter(app => app.status === status);
};

// Search applications by student name or roll number
export const searchApplications = (applications: Application[], searchTerm: string): Application[] => {
  if (!searchTerm.trim()) return applications;
  
  const term = searchTerm.toLowerCase();
  return applications.filter(app => 
    app.studentName.toLowerCase().includes(term) ||
    app.rollNumber.toLowerCase().includes(term) ||
    app.email.toLowerCase().includes(term) ||
    app.department.toLowerCase().includes(term)
  );
};

// Filter audit logs by action
export const filterAuditLogsByAction = (logs: AuditLog[], action: string): AuditLog[] => {
  if (action === 'all') return logs;
  return logs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
};

// Search audit logs
export const searchAuditLogs = (logs: AuditLog[], searchTerm: string): AuditLog[] => {
  if (!searchTerm.trim()) return logs;
  
  const term = searchTerm.toLowerCase();
  return logs.filter(log => 
    log.userName.toLowerCase().includes(term) ||
    log.action.toLowerCase().includes(term) ||
    log.target.toLowerCase().includes(term) ||
    log.details.toLowerCase().includes(term)
  );
};
