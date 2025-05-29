import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Post } from "../types"

export const createPost = async (postData: {
  title: string
  content: string
  category: string
  authorId: string
}): Promise<string> => {
  try {
    const post = {
      title: postData.title,
      content: postData.content,
      category: postData.category,
      authorId: postData.authorId,
      likes: 0,
      comments: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "posts"), post)
    return docRef.id
  } catch (error: any) {
    throw new Error("Failed to create post")
  }
}

export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const posts: Post[] = []
    for (const docSnap of querySnapshot.docs) {
      const postData = docSnap.data()

      // Get author data
      const authorDoc = await getDocs(query(collection(db, "users")))
      const author = authorDoc.docs.find((doc) => doc.id === postData.authorId)?.data()

      if (author) {
        posts.push({
          id: docSnap.id,
          ...postData,
          author: {
            id: postData.authorId,
            ...author,
          },
          createdAt: postData.createdAt.toDate(),
          updatedAt: postData.updatedAt.toDate(),
        } as Post)
      }
    }

    return posts
  } catch (error: any) {
    throw new Error("Failed to fetch posts")
  }
}

export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to like post")
  }
}

export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const postRef = doc(db, "posts", postId)
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to unlike post")
  }
}

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))

  return onSnapshot(q, async (querySnapshot) => {
    const posts: Post[] = []
    for (const docSnap of querySnapshot.docs) {
      const postData = docSnap.data()

      // Get author data
      const authorDoc = await getDocs(query(collection(db, "users")))
      const author = authorDoc.docs.find((doc) => doc.id === postData.authorId)?.data()

      if (author) {
        posts.push({
          id: docSnap.id,
          ...postData,
          author: {
            id: postData.authorId,
            ...author,
          },
          createdAt: postData.createdAt.toDate(),
          updatedAt: postData.updatedAt.toDate(),
        } as Post)
      }
    }

    callback(posts)
  })
}
