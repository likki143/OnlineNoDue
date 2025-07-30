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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Export the app
export default app;
