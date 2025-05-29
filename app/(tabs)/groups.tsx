"use client"

import { useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"

// Mock data
const mockGroups = [
  {
    id: "1",
    name: "Computer Science Society",
    description: "A community for CS students to share knowledge and collaborate on projects.",
    category: "Academic",
    members: ["1", "2", "3"],
    admin: "1",
  },
  {
    id: "2",
    name: "Photography Club",
    description: "Capture the beauty of campus life and improve your photography skills.",
    category: "Arts",
    members: ["1", "4", "5"],
    admin: "4",
  },
]

const categories = ["Academic", "Social", "Sports", "Technology", "Arts"]

export default function GroupsScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [groups] = useState(mockGroups)

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupDescription.trim() || !selectedCategory) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    // Mock create
    setTimeout(() => {
      Alert.alert("Success", "Group created successfully!")
      setModalVisible(false)
      setGroupName("")
      setGroupDescription("")
      setSelectedCategory("")
      setLoading(false)
    }, 1000)
  }

  const handleJoinLeaveGroup = (group: any) => {
    const isMember = group.members.includes("1") // Mock current user ID
    Alert.alert("Success", isMember ? "Left group successfully" : "Joined group successfully")
  }

  const renderGroup = ({ item }: { item: any }) => {
    const isMember = item.members.includes("1") // Mock current user ID
    const isAdmin = item.admin === "1" // Mock current user ID

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

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroup}
        contentContainerStyle={styles.groupsList}
        showsVerticalScrollIndicator={false}
      />

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
