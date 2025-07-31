import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  User
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from './firebase';

export type UserRole = 'student' | 'department_officer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  fullName: string;
  rollNumber?: string;
  department?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: string;
  passwordSetupRequired?: boolean;
  temporaryPassword?: string;
}

export const registerStudent = async (
  email: string, 
  password: string, 
  fullName: string, 
  rollNumber: string,
  department: string,
  phoneNumber: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Create user profile in database
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role: 'student',
      fullName,
      rollNumber,
      department,
      phoneNumber,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };
    
    await set(ref(database, `users/${user.uid}`), userProfile);
    
    return { user, profile: userProfile };
  } catch (error) {
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in user:', email);

    // Test Firebase connection first
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Firebase auth successful for user:', user.uid);

    // Get user profile from database
    console.log('Fetching user profile from database...');
    const profileSnapshot = await get(ref(database, `users/${user.uid}`));
    const profile = profileSnapshot.val() as UserProfile;

    if (!profile) {
      console.error('User profile not found in database for UID:', user.uid);
      throw new Error('User profile not found. Please contact support.');
    }

    console.log('User profile found:', { role: profile.role, emailVerified: profile.emailVerified });

    // Check email verification for students
    if (profile.role === 'student' && !user.emailVerified) {
      console.log('Student email not verified');
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // Update email verification status in profile if it changed
    if (profile.role === 'student' && user.emailVerified && !profile.emailVerified) {
      console.log('Updating email verification status in profile');
      profile.emailVerified = true;
      await set(ref(database, `users/${user.uid}/emailVerified`), true);
    }

    console.log('Sign in successful');
    return { user, profile };
  } catch (error: any) {
    console.error('Sign in error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    // Provide more user-friendly error messages
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }

    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const createDefaultAdmin = async () => {
  try {
    // Check if default admin already exists
    const defaultAdminEmail = 'Admin@nodue.com';
    const defaultAdminPassword = 'Admin@123';

    return await createAdmin(defaultAdminEmail, defaultAdminPassword, 'System Administrator');
  } catch (error) {
    console.log('Default admin may already exist or creation failed:', error);
    throw error;
  }
};

export const createAdmin = async (
  email: string,
  password: string,
  fullName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create admin profile in database
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role: 'admin',
      fullName,
      emailVerified: true, // Admins don't need email verification
      createdAt: new Date().toISOString()
    };

    await set(ref(database, `users/${user.uid}`), userProfile);

    return { user, profile: userProfile };
  } catch (error) {
    throw error;
  }
};

export const createDepartmentOfficer = async (
  email: string,
  password: string,
  fullName: string,
  department: string,
  isTemporaryPassword: boolean = true
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create department officer profile in database
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role: 'department_officer',
      fullName,
      department,
      emailVerified: true, // Department officers don't need email verification
      createdAt: new Date().toISOString(),
      passwordSetupRequired: isTemporaryPassword,
      temporaryPassword: isTemporaryPassword ? password : undefined
    };

    await set(ref(database, `users/${user.uid}`), userProfile);

    return { user, profile: userProfile };
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    return snapshot.val() || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
