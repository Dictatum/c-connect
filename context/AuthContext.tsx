"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { router } from "expo-router"
import { setItemAsync, deleteItemAsync } from 'expo-secure-store'
import type { User } from "../types"
import { Colors } from "../constants/Colors"
import { auth, db } from '../firebase/config'
import { doc, getDoc, setDoc } from "firebase/firestore"
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut 
} from "firebase/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name,
              course: userData.course,
              createdAt: userData.createdAt.toDate(),
            }
            setUser(user)
            await setItemAsync('userToken', 'true')
            if (!loading) {
              router.replace("/(tabs)")
            }
          }
        } else {
          setUser(null)
          await deleteItemAsync('userToken')
        }
      } catch (error) {
        console.error('Auth state change error:', error)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
      
      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      const userData = userDoc.data()
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        name: userData.name,
        course: userData.course,
        createdAt: userData.createdAt.toDate(),
      }
      
      setUser(user)
      await setItemAsync('userToken', 'true')
      router.replace("/(tabs)")
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any): Promise<void> => {
    try {
      console.log("Signing up...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: userData.name,
        course: userData.course,
        email: email,
        createdAt: new Date(),
      })

      router.replace("/login")
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      console.log("Signing out...")
      await firebaseSignOut(auth)
      await deleteItemAsync('userToken')
      setUser(null)
      router.replace("/login")
    } catch (error: any) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textLight,
    marginTop: 16,
    fontSize: 16,
  },
})
