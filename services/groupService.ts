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
}): Promise<string> => {
  try {
    const group = {
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      admin: groupData.adminId,
      members: [groupData.adminId],
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "groups"), group)
    return docRef.id
  } catch (error: any) {
    throw new Error("Failed to create group")
  }
}

export const getGroups = async (): Promise<Group[]> => {
  try {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const groups: Group[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      groups.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
      } as Group)
    })

    return groups
  } catch (error: any) {
    throw new Error("Failed to fetch groups")
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
