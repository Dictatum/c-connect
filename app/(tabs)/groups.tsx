"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { useAuth } from "../../context/AuthContext"
import { useApp } from "../../context/AppContext"
import { createGroup, joinGroup, leaveGroup } from "../../services/groupService"
import type { Group } from "../../types"

const categories = ["Academic", "Social", "Sports", "Technology", "Arts"]

export default function GroupsScreen() {
  const { user } = useAuth()
  const { groups, loadGroups } = useApp()
  const [modalVisible, setModalVisible] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  const handleCreateGroup = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a group")
      return
    }

    if (!groupName.trim() || !groupDescription.trim() || !selectedCategory) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        category: selectedCategory,
        adminId: user.id,
      })

      // Clear form and close modal
      setModalVisible(false)
      setGroupName("")
      setGroupDescription("")
      setSelectedCategory("")

      // Reload groups to show the new one
      await loadGroups()

      Alert.alert("Success", "Group created successfully!")
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeaveGroup = async (group: Group) => {
    if (!user) return

    try {
      const isMember = group.members.includes(user.id)
      if (isMember) {
        await leaveGroup(group.id, user.id)
        Alert.alert("Success", "Left group successfully")
      } else {
        await joinGroup(group.id, user.id)
        Alert.alert("Success", "Joined group successfully")
      }
      loadGroups()
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update group membership")
    }
  }

  const renderGroup = ({ item }: { item: Group }) => {
    if (!user) return null

    const isMember = item.members.includes(user.id)
    const isAdmin = item.admin === user.id

    return (
      <View style={styles.groupCard}>
        <View style={styles.groupPlaceholder}>
          <Ionicons name="people" size={40} color={Colors.primary} />
        </View>

        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupDescription}>{item.description}</Text>
          <Text style={styles.groupMembers}>{item.members.length} members</Text>

          <View style={styles.groupActions}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            {!isAdmin && (
              <TouchableOpacity
                style={[styles.joinButton, isMember && styles.leaveButton]}
                onPress={() => handleJoinLeaveGroup(item)}
              >
                <Text style={[styles.joinButtonText, isMember && styles.leaveButtonText]}>
                  {isMember ? "Leave" : "Join"}
                </Text>
              </TouchableOpacity>
            )}

            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Academic: Colors.primary,
      Social: Colors.success,
      Sports: "#FF6B6B",
      Technology: "#4ECDC4",
      Arts: "#45B7D1",
    }
    return colors[category] || Colors.accent
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Groups</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No groups yet</Text>
          <Text style={styles.emptyStateSubtext}>Create the first group!</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroup}
          contentContainerStyle={styles.groupsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Group</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Group Name"
                placeholderTextColor="#888"
                value={groupName}
                onChangeText={setGroupName}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Group Description"
                placeholderTextColor="#888"
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.sectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[styles.createGroupButton, loading && styles.createGroupButtonDisabled]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                <Text style={styles.createGroupButtonText}>{loading ? "Creating..." : "Create Group"}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  groupsList: {
    paddingHorizontal: 20,
  },
  groupCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
  },
  groupPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInfo: {
    flex: 1,
    marginLeft: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
    lineHeight: 18,
  },
  groupMembers: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  groupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  leaveButton: {
    backgroundColor: Colors.error,
  },
  joinButtonText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: "600",
  },
  leaveButtonText: {
    color: Colors.textLight,
  },
  adminBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminText: {
    color: Colors.textDark,
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  modalForm: {
    padding: 20,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textLight,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textLight,
    marginBottom: 12,
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
  createGroupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  createGroupButtonDisabled: {
    opacity: 0.6,
  },
  createGroupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
  },
})
