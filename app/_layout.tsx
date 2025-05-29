import { Stack } from "expo-router"
import { AuthProvider } from "../context/AuthContext"
import { AppProvider } from "../context/AppContext"

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </AuthProvider>
  )
}
