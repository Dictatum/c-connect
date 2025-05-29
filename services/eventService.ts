import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Event } from "../types"

export const createEvent = async (eventData: {
  title: string
  description: string
  date: Date
  location: string
  organizerId: string
}): Promise<string> => {
  try {
    // Convert the date to Firestore Timestamp
    const event = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      location: eventData.location,
      organizerId: eventData.organizerId,
      attendees: [eventData.organizerId], // Organizer automatically attends
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "events"), {
      ...event,
      date: Timestamp.fromDate(event.date),
      createdAt: Timestamp.fromDate(event.createdAt),
    })
    
    return docRef.id
  } catch (error: any) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event")
  }
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const q = query(collection(db, "events"), orderBy("date", "asc"))
    const querySnapshot = await getDocs(q)

    const events: Event[] = []
    for (const docSnap of querySnapshot.docs) {
      const eventData = docSnap.data()

      // Get organizer data
      const organizerRef = doc(db, "users", eventData.organizerId)
      const organizerDoc = await getDoc(organizerRef)

      if (organizerDoc.exists()) {
        const organizer = organizerDoc.data()
        events.push({
          id: docSnap.id,
          ...eventData,
          organizer: {
            id: eventData.organizerId,
            name: organizer.name,
            // ...other organizer fields you need
          },
          date: eventData.date.toDate(),
          createdAt: eventData.createdAt.toDate(),
        } as Event)
      }
    }

    return events
  } catch (error: any) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }
}

export const attendEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    const eventRef = doc(db, "events", eventId)
    await updateDoc(eventRef, {
      attendees: arrayUnion(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to attend event")
  }
}

export const unattendEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    const eventRef = doc(db, "events", eventId)
    await updateDoc(eventRef, {
      attendees: arrayRemove(userId),
    })
  } catch (error: any) {
    throw new Error("Failed to unattend event")
  }
}
