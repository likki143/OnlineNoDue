// Demo authentication for testing when Firebase is unavailable
export interface DemoUser {
  uid: string;
  email: string;
  role: 'student' | 'department_officer' | 'admin';
  fullName: string;
  emailVerified: boolean;
}

// Demo users for testing
const demoUsers: DemoUser[] = [
  {
    uid: 'demo-student-1',
    email: 'student@demo.com',
    role: 'student',
    fullName: 'Demo Student',
    emailVerified: true
  },
  {
    uid: 'demo-admin-1',
    email: 'Admin@nodue.com',
    role: 'admin',
    fullName: 'System Administrator',
    emailVerified: true
  },
  {
    uid: 'demo-dept-1',
    email: 'dept@demo.com',
    role: 'department_officer',
    fullName: 'Demo Department Officer',
    emailVerified: true
  }
];

export const demoSignIn = async (email: string, password: string): Promise<DemoUser | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find demo user
  const user = demoUsers.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Demo user not found');
  }
  
  // Simple password check (for demo purposes)
  if (password !== 'demo123') {
    throw new Error('Incorrect password (use: demo123)');
  }
  
  return user;
};

export const isDemoMode = () => {
  return window.location.hostname.includes('localhost') || 
         window.location.hostname.includes('dev') ||
         localStorage.getItem('demo-mode') === 'true';
};

export const enableDemoMode = () => {
  localStorage.setItem('demo-mode', 'true');
};

export const disableDemoMode = () => {
  localStorage.removeItem('demo-mode');
};
