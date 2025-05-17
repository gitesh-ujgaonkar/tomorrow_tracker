import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getMessaging } from "firebase/messaging"

// Check if Firebase environment variables are present
const checkEnvVariables = () => {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    if (typeof window !== 'undefined') {
      console.warn('Firebase initialization may fail due to missing environment variables.');
    }
  }
};

// Call the check function
checkEnvVariables();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase with error handling
let app: ReturnType<typeof getApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create placeholder objects to prevent runtime errors
  app = null;
  auth = null;
  db = null;
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: ReturnType<typeof getMessaging> | null = null
if (typeof window !== "undefined" && app) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.error("Firebase messaging failed to initialize:", error)
  }
}

export { app, auth, db, messaging }
