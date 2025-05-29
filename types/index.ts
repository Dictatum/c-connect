export interface User {
  id: string
  email: string
  name: string
  course: string
  createdAt: Date
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
  members: string[]
  admin: string
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  location: string
  organizer: User
  attendees: string[]
  createdAt: Date
}
