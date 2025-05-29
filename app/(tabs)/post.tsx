"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { router } from "expo-router"
import { Colors } from "../../constants/Colors"
import { useAuth } from "../../context/AuthContext"
import { createPost } from "../../services/postService"

const categories = ["Announcements", "Jobs", "Events", "Academic", "Social", "Housing", "Marketplace"]

export default function PostScreen() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePost = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a post")
      return
    }

    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        authorId: user.id,
      })

      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => {
            setTitle("")
            setContent("")
            setSelectedCategory("")
            router.push("/(tabs)")
          },
        },
      ])
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Post</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.titleInput}
            placeholder="Post title..."
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <TextInput
            style={styles.contentInput}
            placeholder="What's happening on campus?"
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={loading}
          >
            <Text style={styles.postButtonText}>{loading ? "Posting..." : "Share Post"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  titleInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
  },
  contentInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    minHeight: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: "#333",
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: Colors.textDark,
  },
  postButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
})
