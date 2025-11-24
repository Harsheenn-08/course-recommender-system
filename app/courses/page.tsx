"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage, type User, type Course } from "@/lib/storage"
import { getAllCourses, getRecommendedCourses } from "@/lib/api"
import Navigation from "@/components/navigation"

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"]

export default function CoursesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [filtered, setFiltered] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [onlyEligible, setOnlyEligible] = useState(false)
  const [useRecommendations, setUseRecommendations] = useState(false)

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadCourses()
  }, [router])

  const loadCourses = async () => {
    try {
      const allCourses = await getAllCourses()
      setCourses(allCourses)
      setFiltered(allCourses)
    } catch (err) {
      console.error("Error loading courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGetRecommendations = async () => {
    if (!user) return
    setLoading(true)
    try {
      const recommended = await getRecommendedCourses(user.cgpa, user.interests, 10)
      setFiltered(recommended)
      setUseRecommendations(true)
    } catch (err) {
      console.error("Error getting recommendations:", err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...courses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.provider.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Difficulty filter
    if (selectedDifficulty) {
      result = result.filter((c) => c.difficulty === selectedDifficulty)
    }

    // Eligibility filter
    if (onlyEligible && user) {
      result = result.filter((c) => c.min_cgpa <= user.cgpa)
    }

    setFiltered(result)
    setUseRecommendations(false)
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedDifficulty, onlyEligible])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Explore Recommended Courses</h1>
          <p className="text-lg text-muted-foreground">Discover courses matched to your skill level and interests</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-card rounded-xl border border-border p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Courses</label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, provider, or tag..."
                className="w-full"
              />
            </div>

            {/* User CGPA (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your CGPA</label>
              <Input type="number" value={user.cgpa.toFixed(2)} readOnly className="w-full bg-muted" />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Difficulty Level</label>
              <select
                value={selectedDifficulty || ""}
                onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">All Levels</option>
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Eligibility Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyEligible}
                  onChange={(e) => setOnlyEligible(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-foreground">Only Eligible Courses</span>
              </label>
            </div>
          </div>

          {/* Your Interests Tags */}
          <div className="mb-6">
            <p className="text-sm font-medium text-foreground mb-2">Your Interests:</p>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGetRecommendations}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1"
            >
              Get Recommendations
            </Button>
            {useRecommendations && (
              <Button
                onClick={() => {
                  setUseRecommendations(false)
                  setFiltered(courses)
                }}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Show All Courses
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> courses
            {useRecommendations && " (Recommendations)"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">Loading courses...</div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Link key={course.course_id} href={`/courses/${course.course_id}`}>
                <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="text-lg font-bold text-foreground line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
                        <span>⭐</span>
                        <span className="text-yellow-700 dark:text-yellow-300">{course.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.provider}</p>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Info Row */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <p className="font-semibold text-foreground">{course.difficulty}</p>
                        <p className="text-xs">Difficulty</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{course.duration_weeks}w</p>
                        <p className="text-xs">Duration</p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {course.rating_count > 0 ? course.rating_count : "0"}
                        </p>
                        <p className="text-xs">Reviews</p>
                      </div>
                    </div>

                    {/* Min CGPA */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        Min CGPA: <span className="font-semibold text-foreground">{course.min_cgpa}</span>
                        {user.cgpa >= course.min_cgpa && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">✓ Eligible</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-muted border-t border-border">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push(`/courses/${course.course_id}`)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedDifficulty(null)
                setOnlyEligible(false)
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
