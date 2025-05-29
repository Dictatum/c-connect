"use client"

import { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { router } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { Colors } from "../constants/Colors"

export default function IndexPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log("User found, redirecting to tabs")
        router.replace("/(tabs)")
      } else {
        console.log("No user, redirecting to login")
        router.replace("/login")
      }
    }
  }, [user, loading])

  // This component should redirect quickly, but show something while loading
  return (
    <View style={styles.container}>
      <Text style={styles.title}>C-CONNECT</Text>
      <Text style={styles.subtitle}>Campus Bulletin Board</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: "600",
  },
})
