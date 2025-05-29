import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Group } from "../types"

export const createGroup = async (groupData: {
  name: string
  description: string
  category: string
  adminId: string
}): Promise<void> => {
  try {
    console.log("Creating group with data:", groupData)
    
    const group = {
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      admin: groupData.adminId,
      members: [groupData.adminId], // Admin is automatically a member
      createdAt: new Date().toISOString() // Store as ISO string
    }

    const docRef = await addDoc(collection(db, "groups"), group)
    console.log("Group created with ID:", docRef.id)
  } catch (error: any) {
    console.error("Error creating group:", error)
    throw new Error(error.message || "Failed to create group")
  }
}

export const getGroups = async (): Promise<Group[]> => {
  try {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: new Date(doc.data().createdAt)
    })) as Group[]
  } catch (error: any) {
    console.error("Error getting groups:", error)
    throw new Error(error.message || "Failed to fetch groups")
  }
}

export const joinGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    const groupRef = doc(db, "groups", groupId)
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to join group")
  }
}

export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  try {
    const groupRef = doc(db, "groups", groupId)
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to leave group")
  }
}
