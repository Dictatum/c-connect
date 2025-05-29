"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { router } from "expo-router"
import * as SecureStore from 'expo-secure-store'
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  onAuthStateChange,
} from "../services/authService"
import type { User } from "../types"
import { Colors } from "../constants/Colors"

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
    console.log("AuthProvider mounted")

    const unsubscribe = onAuthStateChange(async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")
      if (user) {
        await SecureStore.setItemAsync('userToken', 'true')
      } else {
        await SecureStore.deleteItemAsync('userToken')
      }
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in...")
      const user = await authSignIn(email, password)
      await SecureStore.setItemAsync('userToken', 'true')
      setUser(user)
      router.replace("/(tabs)")
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log("Signing up...")
      await authSignUp(email, password, userData)
      // Don't set user here - just return to login screen
      router.replace("/login")
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out...")
      await authSignOut()
      await SecureStore.deleteItemAsync('userToken')
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
