import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user profile from database
    const profileSnapshot = await get(ref(database, `users/${user.uid}`));
    const profile = profileSnapshot.val() as UserProfile;
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Check email verification for students
    if (profile.role === 'student' && !user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Update email verification status in profile if it changed
    if (profile.role === 'student' && user.emailVerified && !profile.emailVerified) {
      profile.emailVerified = true;
      await set(ref(database, `users/${user.uid}/emailVerified`), true);
    }

    return { user, profile };
  } catch (error) {
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

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`));
    return snapshot.val() || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};
