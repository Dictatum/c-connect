"use client"

import { useState } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { useAuth } from "../../context/AuthContext"
import { useApp } from "../../context/AppContext"
import { likePost, unlikePost } from "../../services/postService"
import type { Post } from "../../types"

const categories = ["All", "Announcements", "Jobs", "Events", "Academic", "Social", "Housing", "Marketplace"]

export default function HomeScreen() {
  const { user } = useAuth()
  const { posts, refreshPosts } = useApp()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    refreshPosts()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleLikePost = async (post: Post) => {
    if (!user) return

    try {
      const isLiked = post.likedBy.includes(user.id)
      if (isLiked) {
        await unlikePost(post.id, user.id)
      } else {
        await likePost(post.id, user.id)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update like")
    }
  }

  const filteredPosts = selectedCategory === "All" ? posts : posts.filter((post) => post.category === selectedCategory)

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = user ? item.likedBy.includes(user.id) : false

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
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.likedButton]}
            onPress={() => handleLikePost(item)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? Colors.error : Colors.textLight}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.textLight} />
            <Text style={styles.actionText}>{item.comments}</Text>
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
          data={categories}
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

      {filteredPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No posts yet</Text>
          <Text style={styles.emptyStateSubtext}>Be the first to share something!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.postsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  likedButton: {
    // Additional styling for liked state
  },
  actionText: {
    color: Colors.textLight,
    fontSize: 12,
  },
  likedText: {
    color: Colors.error,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textLight,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
})
