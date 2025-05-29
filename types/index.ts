export interface User {
  id: string
  name: string
  email: string
  course: string
  createdAt: Date
  // Add any other user fields you need
}

export interface Post {
  id: string
  title: string
  content: string
  category: string
  author: User
  likes: number
  comments: number
  likedBy: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: User
  createdAt: Date
}

export interface Group {
  id: string
  name: string
  description: string
  category: string
  admin: string
  members: string[]
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  location: string
  organizer: {
    id: string
    name: string
    // ...other organizer fields
  }
  organizerId: string // Add this field
  attendees: string[]
  createdAt: Date
}
