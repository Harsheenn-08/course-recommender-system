import type { Course } from "./storage"

export type Review = {
  reviewer_name: string | null
  rating: number
  pros: string | null
  cons: string | null
  comment: string | null
  is_senior: number
  created_at: string
}

export type CourseWithReviews = Course & {
  reviews?: Review[]
}

// Backend base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

// Shape of a course as returned by FastAPI
type BackendCourse = {
  course_id: number
  title: string
  provider: string | null
  description: string | null
  tags: string | null
  min_cgpa: number | null
  difficulty: string | null
  duration_weeks: number | null
  avg_rating?: number | null
  rating_count?: number | null
}

// Convert backend course → frontend Course
function mapBackendCourse(c: BackendCourse): Course {
  return {
    course_id: Number(c.course_id),
    title: c.title,
    provider: c.provider ?? "",
    description: c.description ?? "",
    tags: c.tags
      ? c.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    min_cgpa: c.min_cgpa ?? 0,
    difficulty: c.difficulty ?? "",
    duration_weeks: c.duration_weeks ?? 0,
    avg_rating: c.avg_rating ?? 0,
    rating_count: c.rating_count ?? 0,
  }
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`GET ${path} failed with ${res.status}`)
  }
  return res.json()
}

async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`POST ${path} failed with ${res.status}`)
  }
  return res.json()
}

// ============= PUBLIC FUNCTIONS =============

// Get all courses from backend, fallback to local JSON
export async function getAllCourses(): Promise<Course[]> {
  try {
    const data = await apiGet("/api/courses")
    const backendCourses = data.courses as BackendCourse[]
    return backendCourses.map(mapBackendCourse)
  } catch (error) {
    console.error("Backend unavailable in getAllCourses, loading from local:", error)
  }

  const response = await fetch("/data/courses.json")
  const data = await response.json()
  return data.courses as Course[]
}

// Get recommended courses from backend, fallback to local scoring
export async function getRecommendedCourses(
  cgpa: number,
  interests: string[],
  topK = 10,
): Promise<Course[]> {
  try {
    const data = await apiPost("/api/recommend", {
      cgpa,
      interests,
      top_k: topK,
    })
    const backendCourses = data.results as BackendCourse[]
    return backendCourses.map(mapBackendCourse)
  } catch (error) {
    console.error("Backend unavailable in getRecommendedCourses, using fallback:", error)
  }

  // Fallback: local dummy logic
  const allCourses = await getAllCourses()
  const filtered = allCourses
    .filter((c) => c.min_cgpa <= cgpa)
    .filter((c) => c.tags.some((tag) => interests.includes(tag)))
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, topK)

  return filtered.length > 0 ? filtered : allCourses.slice(0, topK)
}

// Get single course by ID
export async function getCourseById(id: string): Promise<CourseWithReviews | null> {
  if (!id || id === "undefined") {
    return null
  }

  try {
    const data = await apiGet(`/api/course/${id}`)
    const backendCourse = data.course as BackendCourse

    const course: CourseWithReviews = mapBackendCourse(backendCourse)

    if (typeof data.avg_rating === "number") {
      course.avg_rating = data.avg_rating
    }
    if (typeof data.rating_count === "number") {
      course.rating_count = data.rating_count
    }

    course.reviews = (data.reviews ?? []) as Review[]

    return course
  } catch (error) {
    console.error("Backend unavailable in getCourseById, falling back:", error)
  }

  // Fallback: search locally if backend fails
  const courses = await getAllCourses()
  const found = courses.find((c) => String(c.course_id) === String(id))
  if (!found) return null

  const course: CourseWithReviews = { ...found, reviews: [] }
  return course
}
export async function addReview(input: {
  course_id: number
  rating: number
  reviewer_name?: string
  pros?: string
  cons?: string
  comment?: string
  is_senior?: boolean
  user_id?: string
}): Promise<void> {
  const payload = {
    course_id: input.course_id,
    user_id: input.user_id ?? "anon",
    reviewer_name: input.reviewer_name ?? null,
    rating: input.rating,
    pros: input.pros ?? null,
    cons: input.cons ?? null,
    comment: input.comment ?? null,
    is_senior: input.is_senior ? 1 : 0,
  }

  await apiPost("/api/review", payload)
}
