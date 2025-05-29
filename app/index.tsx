

import { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { router } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { Colors } from "../constants/Colors"

export default function IndexPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      console.log("User authenticated, redirecting to tabs")
      router.replace("/(tabs)")
    }
  }, [user, loading])

  const handleGetStarted = () => {
    console.log("Navigating to login")
    router.push("/login")
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>C-CONNECT</Text>
        <Text style={styles.subtitle}>
          Your Campus Community Hub{"\n"}
        </Text>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGetStarted}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    marginBottom: 48,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    maxWidth: 300,
  },
  buttonText: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
})
