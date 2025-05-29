"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { subscribeToPosts } from "../services/postService"
import { getGroups } from "../services/groupService"
import { getEvents } from "../services/eventService"
import type { Post, Group, Event } from "../types"

interface AppContextType {
  posts: Post[]
  groups: Group[]
  events: Event[]
  categories: string[]
  loadGroups: () => Promise<void>
  loadEvents: () => Promise<void>
  refreshPosts: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [events, setEvents] = useState<Event[]>([])

  const categories = ["Announcements", "Jobs", "Events", "Academic", "Social", "Housing", "Marketplace"]

  useEffect(() => {
    console.log("Setting up posts subscription...")
    // Subscribe to real-time posts updates
    const unsubscribe = subscribeToPosts((posts) => {
      console.log("Received posts update:", posts.length)
      setPosts(posts)
    })

    return unsubscribe
  }, [])

  const loadGroups = async () => {
    try {
      console.log("Loading groups...")
      const groupsData = await getGroups()
      console.log("Loaded groups:", groupsData.length)
      setGroups(groupsData)
    } catch (error) {
      console.error("Failed to load groups:", error)
    }
  }

  const loadEvents = async () => {
    try {
      console.log("Loading events...")
      const eventsData = await getEvents()
      console.log("Loaded events:", eventsData.length)
      setEvents(eventsData)
    } catch (error) {
      console.error("Failed to load events:", error)
    }
  }

  const refreshPosts = () => {
    // Posts are automatically updated via subscription
    console.log("Refreshing posts...")
  }

  return (
    <AppContext.Provider
      value={{
        posts,
        groups,
        events,
        categories,
        loadGroups,
        loadEvents,
        refreshPosts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
