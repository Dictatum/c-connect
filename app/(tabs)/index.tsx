"use client"

import { useState } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"

// Mock data for now
const mockPosts = [
  {
    id: "1",
    title: "Welcome to Campus!",
    content: "New semester orientation starts tomorrow at 9 AM in the main auditorium.",
    category: "Announcements",
    author: { name: "Campus Admin" },
    likes: 15,
    comments: 3,
    likedBy: [],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Study Group - Data Structures",
    content: "Starting a study group for Data Structures and Algorithms. We meet every Tuesday and Thursday at 6 PM.",
    category: "Academic",
    author: { name: "Alex Chen" },
    likes: 12,
    comments: 7,
    likedBy: [],
    createdAt: new Date(),
  },
]

const categories = ["Announcements", "Jobs", "Events", "Academic", "Social", "Housing", "Marketplace"]

export default function HomeScreen() {
  const [posts] = useState(mockPosts)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    // Mock refresh
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleLikePost = (postId: string) => {
    console.log("Liked post:", postId)
  }

  const filteredPosts = selectedCategory === "All" ? posts : posts.filter((post) => post.category === selectedCategory)

  const renderPost = ({ item }: { item: any }) => {
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.authorImagePlaceholder}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.postTime}>{item.createdAt.toLocaleDateString()}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLikePost(item.id)}>
            <Ionicons name="heart-outline" size={20} color={Colors.textLight} />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.textLight} />
            <Text style={styles.actionText}>{item.comments || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Announcements: Colors.primary,
      Jobs: Colors.success,
      Events: "#FF6B6B",
      Academic: "#4ECDC4",
      Social: "#45B7D1",
      Housing: "#9B59B6",
      Marketplace: "#E67E22",
    }
    return colors[category] || Colors.accent
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Feed</Text>
      </View>

      <View style={styles.categoryFilter}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["All", ...categories]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryButtonText, selectedCategory === item && styles.categoryButtonTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: 16,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: Colors.textDark,
  },
  postsList: {
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  postTime: {
    color: "#888",
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.textDark,
    fontSize: 10,
    fontWeight: "600",
  },
  postTitle: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  postContent: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: Colors.textLight,
    fontSize: 12,
  },
})
