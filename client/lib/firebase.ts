import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDerDRhhoN2_-Vg4-aVbMEU59JRY4s2uUI",
  authDomain: "onlinenodue.firebaseapp.com",
  databaseURL: "https://onlinenodue-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "onlinenodue",
  storageBucket: "onlinenodue.firebasestorage.app",
  messagingSenderId: "117829589582",
  appId: "1:117829589582:web:37fe515a9754f1d23b411f",
  measurementId: "G-ZMH4T254TS"
};

console.log('Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

console.log('Firebase services initialized:', {
  auth: !!auth,
  database: !!database,
  storage: !!storage
});

// Export the app
export default app;
