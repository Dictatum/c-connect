import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"
import type { User } from "../types"

export const signUp = async (
  email: string,
  password: string,
  userData: { name: string; course: string },
): Promise<User> => {
  try {
    console.log("Creating user with email:", email)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: userData.name,
      course: userData.course,
      createdAt: new Date(),
    }

    console.log("Saving user data to Firestore")
    await setDoc(doc(db, "users", firebaseUser.uid), user)

    // Sign out the user after registration so they need to login
    await firebaseSignOut(auth)

    return user
  } catch (error: any) {
    console.error("Sign up error:", error)
    throw new Error(error.message)
  }
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    console.log("Signing in with email:", email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    console.log("Getting user data from Firestore")
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    if (!userDoc.exists()) {
      throw new Error("User data not found")
    }

    return userDoc.data() as User
  } catch (error: any) {
    console.error("Sign in error:", error)
    throw new Error(error.message)
  }
}

export const signOut = async (): Promise<void> => {
  try {
    console.log("Signing out")
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error("Sign out error:", error)
    throw new Error(error.message)
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) {
    console.log("No current Firebase user")
    return null
  }

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    if (!userDoc.exists()) {
      console.log("User document not found")
      return null
    }

    return userDoc.data() as User
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("Auth state changed:", firebaseUser ? "User exists" : "No user")
    if (firebaseUser) {
      try {
        const user = await getCurrentUser()
        callback(user)
      } catch (error) {
        console.error("Error in auth state change:", error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}
