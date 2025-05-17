import {
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  updateProfile,
} from "firebase/auth"
import { auth } from "./config"
import { createUser } from "./firestore"

export async function createUserWithEmailAndPassword(email: string, password: string, name: string) {
  try {
    // Create user in Firebase Auth
    const userCredential = await firebaseCreateUser(auth, email, password)
    const user = userCredential.user

    // Update profile with name
    await updateProfile(user, { displayName: name })

    // Create user document in Firestore
    await createUser({
      id: user.uid,
      email: user.email || email,
      name: name,
      image: user.photoURL || "",
    })

    return user
  } catch (error: any) {
    console.error("Error creating user:", error)
    throw new Error(error.message || "Failed to create user")
  }
}

export async function signInWithEmailAndPassword(email: string, password: string) {
  try {
    return await firebaseSignIn(auth, email, password)
  } catch (error: any) {
    console.error("Error signing in:", error)
    throw new Error(error.message || "Failed to sign in")
  }
}
