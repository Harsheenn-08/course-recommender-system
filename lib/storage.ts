export interface User {
  user_id: string
  name: string
  email: string
  cgpa: number
  interests: string[]
}

export interface Course {
  course_id: string
  title: string
  provider: string
  description: string
  tags: string[]
  min_cgpa: number
  difficulty: string
  duration_weeks: number
  url: string
  avg_rating: number
  rating_count: number
}

export interface Review {
  review_id: string
  course_id: string
  reviewer_name: string
  rating: number
  pros: string
  cons: string
  comment: string
  is_senior: boolean
  created_at: string
}

export interface Interaction {
  user_id: string
  course_id: string
  event_type: string
  details: string
  created_at: string
}

export const storage = {
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
  },
  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user) : null
    }
    return null
  },
  setCourses: (courses: Course[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("courses", JSON.stringify(courses))
    }
  },
  getCourses: (): Course[] => {
    if (typeof window !== "undefined") {
      const courses = localStorage.getItem("courses")
      return courses ? JSON.parse(courses) : []
    }
    return []
  },
  addReview: (review: Review) => {
    if (typeof window !== "undefined") {
      const reviews = storage.getReviews()
      reviews.push(review)
      localStorage.setItem("reviews", JSON.stringify(reviews))
    }
  },
  getReviews: (): Review[] => {
    if (typeof window !== "undefined") {
      const reviews = localStorage.getItem("reviews")
      return reviews ? JSON.parse(reviews) : []
    }
    return []
  },
  getReviewsByCourse: (courseId: string): Review[] => {
    return storage.getReviews().filter((r) => r.course_id === courseId)
  },
  addInteraction: (interaction: Interaction) => {
    if (typeof window !== "undefined") {
      const interactions = storage.getInteractions()
      interactions.push(interaction)
      localStorage.setItem("interactions", JSON.stringify(interactions))
    }
  },
  getInteractions: (): Interaction[] => {
    if (typeof window !== "undefined") {
      const interactions = localStorage.getItem("interactions")
      return interactions ? JSON.parse(interactions) : []
    }
    return []
  },
}
