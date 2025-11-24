import type { Course } from "./storage"

export async function getRecommendedCourses(cgpa: number, interests: string[], topK = 10): Promise<Course[]> {
  try {
    // TODO: connect to FastAPI backend for real recommendations
    // POST /api/recommend { cgpa, interests, top_k } → returns top 10 courses
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cgpa, interests, top_k: topK }),
    })
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log("Backend unavailable, using local fallback")
  }

  // Fallback: local dummy filtering
  const allCourses = await getAllCourses()
  const filtered = allCourses
    .filter((c) => c.min_cgpa <= cgpa)
    .filter((c) => c.tags.some((tag) => interests.includes(tag)))
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, topK)

  return filtered.length > 0 ? filtered : allCourses.slice(0, topK)
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const response = await fetch("/api/courses")
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log("Backend unavailable, loading from local data")
  }

  // Fallback: load from public JSON file
  const response = await fetch("/data/courses.json")
  const data = await response.json()
  return data.courses
}

export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const response = await fetch(`/api/course/${id}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log("Backend unavailable, searching locally")
  }

  const courses = await getAllCourses()
  return courses.find((c) => c.course_id === id) || null
}
