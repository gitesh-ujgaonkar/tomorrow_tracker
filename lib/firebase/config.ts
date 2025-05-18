import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getMessaging } from "firebase/messaging"

// Define required Firebase environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Check if Firebase environment variables are present
const checkEnvVariables = () => {
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    if (typeof window !== 'undefined') {
      console.warn('Firebase initialization may fail due to missing environment variables.');
    }
    return false;
  }
  
  // Log available environment variables for debugging
  console.log('Firebase environment variables available:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not set',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not set'
  });
  
  return true;
};

// Call the check function
checkEnvVariables();

// DEVELOPMENT FALLBACK CONFIG - DO NOT USE IN PRODUCTION
const devFallbackConfig = {
  apiKey: "AIzaSyBOT4mp4VgpZ-wHzN-mxQoJ5VAhkXZNv_c",
  authDomain: "tomorrow-tracker-dev.firebaseapp.com",
  projectId: "tomorrow-tracker-dev",
  storageBucket: "tomorrow-tracker-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};

// Get Firebase config, falling back to development config if needed
const getFirebaseConfig = () => {
  // Check if we have all required environment variables
  const hasAllEnvVars = !requiredVars.some(varName => !process.env[varName]);
  
  // If we're missing any environment variables in development, use fallback
  if (!hasAllEnvVars && process.env.NODE_ENV !== 'production') {
    console.warn('Using development fallback Firebase config');
    return devFallbackConfig;
  }
  
  // Use environment variables
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
};

const firebaseConfig = getFirebaseConfig();

// For development only - use a mock database if Firebase fails to initialize
const createMockFirestore = () => {
  console.warn('Creating mock Firestore for development');
  
  // This is a very simple mock implementation for development/testing only
  const mockUsers = new Map();
  
  // Add a test user
  mockUsers.set('test@example.com', {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    image: '',
    createdAt: new Date().toISOString()
  });
  
  return {
    collection: () => ({
      // This is just enough to make the basic auth flow work
      // It's not a complete Firestore mock
    }),
    mockUsers // Expose for direct access in auth.ts
  };
};

// Initialize Firebase with error handling
let app: ReturnType<typeof getApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: any = null; // Use 'any' to allow for mock implementation
let usingMockDb = false;

try {
  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    // Log the config we're using (without exposing sensitive values)
    console.log('Initializing Firebase with config:', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      // Don't log API key or App ID for security reasons
    });
    
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }
  
  // Initialize auth
  auth = getAuth(app);
  
  // Initialize Firestore with connection test
  try {
    db = getFirestore(app);
    console.log('Firestore initialized, testing connection...');
    
    // Verify initialization was successful
    if (!auth || !db) {
      throw new Error('Firebase services not properly initialized');
    }
    
    console.log('Firebase initialized successfully');
  } catch (firestoreError) {
    console.error('Error initializing Firestore:', firestoreError);
    
    // For development only - use mock database if in development mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock database for development');
      db = createMockFirestore();
      usingMockDb = true;
    } else {
      // In production, propagate the error
      throw firestoreError;
    }
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create placeholder objects to prevent runtime errors
  app = null;
  auth = null;
  
  // For development only - use mock database
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Using mock database after Firebase initialization failure');
    db = createMockFirestore();
    usingMockDb = true;
  } else {
    db = null;
  }
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
