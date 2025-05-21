import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"
import { format, subDays, parseISO } from "date-fns"

// User types
export interface User {
  id: string
  email: string
  name: string
  image?: string
  createdAt?: string
  updatedAt?: string
}

// Goal types
export interface Goal {
  id: string
  userId: string
  text: string
  date: string
  hasTime: boolean
  time: string | null
  completed: boolean
  createdAt: string
  updatedAt?: string
}

// User settings types
export interface UserSettings {
  enableNotifications: boolean
  reminderTime: string
  enableTimeBasedAlerts: boolean
}

// User functions
export async function createUser(user: User) {
  if (!db) {
    console.error("Firestore database is not initialized when creating user");
    throw new Error("Database connection error: Firestore is not initialized when creating user");
  }
  
  try {
    console.log("Creating user document in Firestore for ID:", user.id);
    console.log("User data:", JSON.stringify(user));
    
    // Check if Firestore is properly connected by attempting a simple operation
    try {
      const userRef = doc(db, "users", user.id);
      console.log("User reference created successfully");
      
      // Attempt to write the user document
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("User document created successfully");

      // Create default settings
      await setDoc(doc(db, "userSettings", user.id), {
        enableNotifications: true,
        reminderTime: "21:00", // 9:00 PM
        enableTimeBasedAlerts: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("User settings created successfully");
    } catch (firestoreError: any) {
      console.error("Firestore operation failed:", firestoreError);
      console.error("Firestore error details:", JSON.stringify(firestoreError));
      throw new Error(`Firestore operation failed: ${firestoreError.message || 'Unknown Firestore error'}`);
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    console.error("Error details:", JSON.stringify(error));
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  console.log("getUserByEmail called with:", email);
  console.log("Database object status:", db ? "exists" : "null");
  
  if (!db) {
    console.error("Firestore database is not initialized");
    console.error("Environment check:", {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "yes" : "no",
      hasProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "yes" : "no"
    });
    throw new Error("Database connection error: Firestore is not initialized");
  }
  
  try {
    console.log("Attempting to get user by email:", email);
    
    const usersRef = collection(db, "users");
    console.log("Collection reference created");
    
    const q = query(usersRef, where("email", "==", email));
    console.log("Query created");
    
    try {
      console.log("Executing query...");
      const querySnapshot = await getDocs(q);
      console.log("Query executed successfully");
      
      if (querySnapshot.empty) {
        console.log("No user found with email:", email);
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      console.log("User found:", userDoc.id);
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (firestoreError) {
      console.error("Firestore query error:", firestoreError);
      console.error("Firestore query error details:", JSON.stringify(firestoreError));
      throw new Error(`Database query error: ${firestoreError.message || 'Failed to query Firestore'}`);
    }
  } catch (error) {
    console.error("Error getting user by email:", error);
    console.error("Error details:", JSON.stringify(error));
    throw new Error(`Database error: ${error.message || 'Unknown database error'}`);
  }
}

export async function createUserFromGoogle(userData: { email: string; name: string; image: string }) {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)

    if (existingUser) {
      // Update existing user
      const userRef = doc(db, "users", existingUser.id)
      await updateDoc(userRef, {
        name: userData.name,
        image: userData.image,
        updatedAt: serverTimestamp(),
      })
      return existingUser
    }

    // Create new user
    const usersRef = collection(db, "users")
    const newUserRef = doc(usersRef)
    const newUser = {
      id: newUserRef.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(newUserRef, newUser)

    // Create default settings
    await setDoc(doc(db, "userSettings", newUserRef.id), {
      enableNotifications: true,
      reminderTime: "21:00", // 9:00 PM
      enableTimeBasedAlerts: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return newUser
  } catch (error) {
    console.error("Error creating/updating user from Google:", error)
    throw error
  }
}

// Goal functions
export async function addGoal(goalData: Omit<Goal, "id" | "updatedAt">) {
  try {
    const goalsRef = collection(db, "goals")
    const newGoalRef = await addDoc(goalsRef, {
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      id: newGoalRef.id,
      ...goalData,
    }
  } catch (error) {
    console.error("Error adding goal:", error)
    throw error
  }
}

export async function getGoalById(goalId: string) {
  try {
    const goalRef = doc(db, "goals", goalId)
    const goalDoc = await getDoc(goalRef)

    if (!goalDoc.exists()) {
      return null
    }

    return { id: goalDoc.id, ...goalDoc.data() } as Goal
  } catch (error) {
    console.error("Error getting goal by ID:", error)
    throw error
  }
}

export async function getGoalsByDate(userId: string, date: string) {
  try {
    const goalsRef = collection(db, "goals")
    const q = query(goalsRef, where("userId", "==", userId), where("date", "==", date), orderBy("createdAt", "asc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Goal)
  } catch (error) {
    console.error("Error getting goals by date:", error)
    throw error
  }
}

export async function getGoalsByDateRange(userId: string, startDate: string, endDate: string) {
  try {
    const goalsRef = collection(db, "goals")
    const q = query(
      goalsRef,
      where("userId", "==", userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc"),
      orderBy("createdAt", "asc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Goal)
  } catch (error) {
    console.error("Error getting goals by date range:", error)
    throw error
  }
}

export async function updateGoal(goal: Goal) {
  try {
    const goalRef = doc(db, "goals", goal.id)
    await updateDoc(goalRef, {
      ...goal,
      updatedAt: serverTimestamp(),
    })
    return goal
  } catch (error) {
    console.error("Error updating goal:", error)
    throw error
  }
}

export async function deleteGoal(goalId: string) {
  try {
    const goalRef = doc(db, "goals", goalId)
    await deleteDoc(goalRef)
    return true
  } catch (error) {
    console.error("Error deleting goal:", error)
    throw error
  }
}

// User settings functions
export async function getUserSettings(userId: string) {
  try {
    const settingsRef = doc(db, "userSettings", userId)
    const settingsDoc = await getDoc(settingsRef)

    if (!settingsDoc.exists()) {
      // Create default settings if they don't exist
      const defaultSettings: UserSettings = {
        enableNotifications: true,
        reminderTime: "21:00", // 9:00 PM
        enableTimeBasedAlerts: true,
      }

      await setDoc(settingsRef, {
        ...defaultSettings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return defaultSettings
    }

    return settingsDoc.data() as UserSettings
  } catch (error) {
    console.error("Error getting user settings:", error)
    throw error
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings) {
  try {
    const settingsRef = doc(db, "userSettings", userId)
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp(),
    })
    return settings
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error
  }
}

// Streak and progress functions
export async function getUserStreak(userId: string) {
  try {
    const today = format(new Date(), "yyyy-MM-dd")
    let currentDate = today
    let streakCount = 0
    let continuousStreak = true

    // Check up to 100 days back (arbitrary limit to prevent infinite loops)
    for (let i = 0; i < 100 && continuousStreak; i++) {
      const dateToCheck = i === 0 ? currentDate : format(subDays(parseISO(currentDate), 1), "yyyy-MM-dd")

      // Get goals for this date
      const goals = await getGoalsByDate(userId, dateToCheck)

      // If no goals for this date, break the streak
      if (goals.length === 0) {
        continuousStreak = false
        break
      }

      // Check if all goals are completed
      const allCompleted = goals.every((goal) => goal.completed)

      if (allCompleted) {
        streakCount++
        currentDate = dateToCheck
      } else {
        // For today, we don't break the streak if not all goals are completed yet
        if (i === 0 && dateToCheck === today) {
          // Check yesterday instead
          continue
        } else {
          continuousStreak = false
          break
        }
      }
    }

    return streakCount
  } catch (error) {
    console.error("Error getting user streak:", error)
    throw error
  }
}
