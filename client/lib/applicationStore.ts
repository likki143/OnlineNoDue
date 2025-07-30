// Simple application state management using localStorage
// In production, this would be replaced with Firebase Realtime Database

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  email: string;
  department: string;
  course: string;
  year: string;
  submissionDate: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  progress: {
    library: 'pending' | 'approved' | 'rejected';
    hostel: 'pending' | 'approved' | 'rejected';
    accounts: 'pending' | 'approved' | 'rejected';
    lab: 'pending' | 'approved' | 'rejected';
    sports: 'pending' | 'approved' | 'rejected';
  };
  reason?: string;
  collegeName?: string;
  documents?: {
    idCard?: string;
    supportingDocs?: string;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  course: string;
  phone: string;
  registrationDate: string;
  emailVerified: boolean;
  status: 'active' | 'inactive';
}

export interface DepartmentOfficer {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  createdDate: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
}

// Application Store
class ApplicationStore {
  private readonly APPLICATIONS_KEY = 'noDue_applications';
  private readonly STUDENTS_KEY = 'noDue_students';
  private readonly OFFICERS_KEY = 'noDue_officers';
  private readonly AUDIT_KEY = 'noDue_audit';

  // Applications
  getAllApplications(): Application[] {
    const data = localStorage.getItem(this.APPLICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getApplicationsByStudentId(studentId: string): Application[] {
    return this.getAllApplications().filter(app => app.studentId === studentId);
  }

  canStudentApply(studentId: string): boolean {
    const applications = this.getAllApplications();
    return !applications.some(app => app.studentId === studentId);
  }

  getStudentApplicationStatus(studentId: string): 'none' | 'pending' | 'in_progress' | 'approved' | 'rejected' {
    const applications = this.getAllApplications();
    const studentApp = applications.find(app => app.studentId === studentId);
    return studentApp ? studentApp.status : 'none';
  }

  submitApplication(application: Omit<Application, 'id' | 'submissionDate' | 'status' | 'progress'>): Application {
    const applications = this.getAllApplications();

    // Check if student already has an application
    const existingApplication = applications.find(app => app.studentId === application.studentId);
    if (existingApplication) {
      throw new Error('You have already submitted an application. Only one application per student is allowed.');
    }

    const newApplication: Application = {
      ...application,
      id: Date.now().toString(),
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      progress: {
        library: 'pending',
        hostel: 'pending',
        accounts: 'pending',
        lab: 'pending',
        sports: 'pending'
      }
    };

    applications.push(newApplication);
    localStorage.setItem(this.APPLICATIONS_KEY, JSON.stringify(applications));

    // Log the action
    this.addAuditLog({
      userId: application.studentId,
      userName: application.studentName,
      action: 'Application Submitted',
      target: `Application #${newApplication.id}`,
      details: `No due application submitted for ${application.department}`,
      ipAddress: '192.168.1.100'
    });

    return newApplication;
  }

  updateApplicationStatus(applicationId: string, departmentStatus: Partial<Application['progress']>): void {
    const applications = this.getAllApplications();
    const appIndex = applications.findIndex(app => app.id === applicationId);
    
    if (appIndex !== -1) {
      applications[appIndex].progress = {
        ...applications[appIndex].progress,
        ...departmentStatus
      };

      // Update overall status based on progress
      const progress = applications[appIndex].progress;
      const statuses = Object.values(progress);
      
      if (statuses.every(status => status === 'approved')) {
        applications[appIndex].status = 'approved';
      } else if (statuses.some(status => status === 'rejected')) {
        applications[appIndex].status = 'rejected';
      } else if (statuses.some(status => status === 'approved')) {
        applications[appIndex].status = 'in_progress';
      } else {
        applications[appIndex].status = 'pending';
      }

      localStorage.setItem(this.APPLICATIONS_KEY, JSON.stringify(applications));
    }
  }

  // Students
  getAllStudents(): Student[] {
    const data = localStorage.getItem(this.STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addStudent(student: Omit<Student, 'id' | 'registrationDate' | 'status'>): Student {
    const students = this.getAllStudents();
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    students.push(newStudent);
    localStorage.setItem(this.STUDENTS_KEY, JSON.stringify(students));
    return newStudent;
  }

  // Department Officers
  getAllOfficers(): DepartmentOfficer[] {
    const data = localStorage.getItem(this.OFFICERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  addOfficer(officer: Omit<DepartmentOfficer, 'id' | 'createdDate' | 'status'>): DepartmentOfficer {
    const officers = this.getAllOfficers();
    const newOfficer: DepartmentOfficer = {
      ...officer,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    officers.push(newOfficer);
    localStorage.setItem(this.OFFICERS_KEY, JSON.stringify(officers));
    
    // Log the action
    this.addAuditLog({
      userId: 'admin',
      userName: 'System Administrator',
      action: 'Officer Created',
      target: `Officer Account`,
      details: `Department officer created: ${officer.name} for ${officer.department}`,
      ipAddress: '192.168.1.10'
    });

    return newOfficer;
  }

  // Audit Logs
  getAllAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(this.AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.getAllAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }

    localStorage.setItem(this.AUDIT_KEY, JSON.stringify(logs));
    return newLog;
  }

  // Statistics
  getStatistics() {
    const applications = this.getAllApplications();
    const students = this.getAllStudents();
    const officers = this.getAllOfficers();

    return {
      totalStudents: students.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      inProgressApplications: applications.filter(app => app.status === 'in_progress').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      totalDepartments: 5, // Fixed number of departments
      activeOfficers: officers.filter(officer => officer.status === 'active').length
    };
  }

  // Clear all data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.APPLICATIONS_KEY);
    localStorage.removeItem(this.STUDENTS_KEY);
    localStorage.removeItem(this.OFFICERS_KEY);
    localStorage.removeItem(this.AUDIT_KEY);
  }
}

export const applicationStore = new ApplicationStore();
