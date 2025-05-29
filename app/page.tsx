import { View, Text, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

export default function Page() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to C-CONNECT!</Text>
      <Text style={styles.subtitle}>Your Campus Bulletin Board</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
})
