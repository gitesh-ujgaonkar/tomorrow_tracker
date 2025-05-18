import {
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  updateProfile,
  type Auth,
} from "firebase/auth"
import { auth } from "./config"
import { createUser } from "./firestore"

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please use a different email or try signing in.';
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use a stronger password.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/configuration-not-found':
      return 'Authentication configuration error. Please contact support.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
}

export async function createUserWithEmailAndPassword(email: string, password: string, name: string) {
  if (!auth) {
    throw new Error("Firebase auth is not initialized. Please check your environment variables.")
  }

  try {
    console.log("Starting user creation process for:", email);
    
    // Create user in Firebase Auth
    const userCredential = await firebaseCreateUser(auth, email, password)
    const user = userCredential.user
    console.log("User created in Firebase Auth:", user.uid);

    // Update profile with name
    await updateProfile(user, { displayName: name })
    console.log("User profile updated with name:", name);

    // Create user document in Firestore
    await createUser({
      id: user.uid,
      email: user.email || email,
      name: name,
      image: user.photoURL || "",
    })
    console.log("User document created in Firestore");

    return user
  } catch (error: any) {
    console.error("Error creating user:", error)
    const errorCode = error.code || '';
    const errorMessage = getAuthErrorMessage(errorCode) || error.message || "Failed to create user";
    throw new Error(errorMessage)
  }
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized. Please check your environment variables.")
  }
  
  // Log Firebase auth state for debugging
  console.log("Firebase auth state:", {
    initialized: !!auth,
    currentUser: auth.currentUser ? "Yes" : "No"
  });
  
  try {
    console.log("Attempting to sign in user with Firebase:", email);
    
    // Attempt to sign in with Firebase
    const result = await firebaseSignIn(auth, email, password)
    
    if (!result || !result.user) {
      console.error("Firebase returned empty result");
      throw new Error("Authentication failed: Empty response from Firebase");
    }
    
    console.log("User signed in successfully with Firebase:", result.user.uid);
    return result
  } catch (error: any) {
    console.error("Error signing in with Firebase:", error);
    
    // Enhanced error handling with more details
    const errorCode = error.code || '';
    console.log("Firebase error code:", errorCode);
    
    const errorMessage = getAuthErrorMessage(errorCode) || error.message || "Failed to sign in";
    console.log("Throwing error with message:", errorMessage);
    
    // Preserve the original error code in the error message for better debugging
    throw new Error(`${errorMessage} (${errorCode})`)
  }
}
