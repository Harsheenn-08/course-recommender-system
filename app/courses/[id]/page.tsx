"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { storage, type User, type Course, type Review } from "@/lib/storage"
import { getCourseById } from "@/lib/api"
import Navigation from "@/components/navigation"

export default function CourseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [avgRating, setAvgRating] = useState(0)

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    pros: "",
    cons: "",
    comment: "",
    isSenior: false,
  })

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadCourseDetails()
  }, [router, courseId])

  const loadCourseDetails = async () => {
    try {
      const courseData = await getCourseById(courseId)
      if (courseData) {
        setCourse(courseData)
        const courseReviews = storage.getReviewsByCourse(courseId)
        setReviews(courseReviews)

        // Calculate average rating from local reviews
        if (courseReviews.length > 0) {
          const avg = courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
          setAvgRating(avg)
        } else {
          setAvgRating(courseData.avg_rating)
        }
      }
    } catch (err) {
      console.error("Error loading course details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !course) return

    const newReview: Review = {
      review_id: Date.now().toString(),
      course_id: courseId,
      reviewer_name: user.name,
      rating: reviewForm.rating,
      pros: reviewForm.pros,
      cons: reviewForm.cons,
      comment: reviewForm.comment,
      is_senior: reviewForm.isSenior,
      created_at: new Date().toISOString(),
    }

    storage.addReview(newReview)
    setReviews([...reviews, newReview])

    // Update average rating
    const newAvg = [...reviews, newReview].reduce((sum, r) => sum + r.rating, 0) / [...reviews, newReview].length
    setAvgRating(newAvg)

    // Reset form
    setReviewForm({
      rating: 5,
      pros: "",
      cons: "",
      comment: "",
      isSenior: false,
    })
    setShowReviewForm(false)
  }

  const handleMarkComplete = () => {
    if (user && course) {
      storage.addInteraction({
        user_id: user.user_id,
        course_id: course.course_id,
        event_type: "course_completed",
        details: `Completed ${course.title}`,
        created_at: new Date().toISOString(),
      })
      alert("Course marked as complete!")
    }
  }

  const handlePayment = () => {
    router.push(`/payment?course_id=${courseId}`)
  }

  if (!user) return null
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  if (!course)
    return <div className="min-h-screen bg-background flex items-center justify-center">Course not found</div>

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8 border border-border">
          <div className="mb-4">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold mb-4">
              {course.difficulty}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">{course.title}</h1>

          <p className="text-xl text-muted-foreground mb-6">{course.provider}</p>

          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center gap-2">
                ⭐ {avgRating.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{course.duration_weeks}</div>
              <p className="text-sm text-muted-foreground">Weeks Duration</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">{course.min_cgpa}</div>
              <p className="text-sm text-muted-foreground">Min CGPA</p>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-card rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Course</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{course.description}</p>
            </section>

            {/* Course Info */}
            <section className="bg-card rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Course Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-semibold text-foreground">{course.provider}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold text-foreground">{course.duration_weeks} weeks</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Difficulty Level</span>
                  <span className="font-semibold text-foreground">{course.difficulty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minimum CGPA</span>
                  <span className="font-semibold text-foreground">{course.min_cgpa}</span>
                </div>
              </div>
            </section>

            {/* Tags */}
            <section className="bg-card rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">Topics Covered</h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-card rounded-xl p-8 border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Senior Reviews ({reviews.length})</h2>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="pb-6 border-b border-border last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {review.reviewer_name}
                            {review.is_senior && (
                              <span className="ml-2 px-2 py-1 rounded bg-accent/20 text-accent text-sm font-semibold">
                                Senior
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {review.pros && (
                          <div>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Pros:</p>
                            <p className="text-muted-foreground">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div>
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Cons:</p>
                            <p className="text-muted-foreground">{review.cons}</p>
                          </div>
                        )}
                        {review.comment && <p className="text-muted-foreground italic">"{review.comment}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </section>

            {/* Review Form */}
            {!showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3"
              >
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitReview} className="bg-card rounded-xl p-8 border border-border space-y-6">
                <h3 className="text-xl font-bold text-foreground">Share Your Experience</h3>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-4xl transition-all ${
                          star <= reviewForm.rating ? "text-yellow-500" : "text-gray-300"
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Pros</label>
                  <textarea
                    value={reviewForm.pros}
                    onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                    placeholder="What did you like about this course?"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Cons</label>
                  <textarea
                    value={reviewForm.cons}
                    onChange={(e) => setReviewForm({ ...reviewForm, cons: e.target.value })}
                    placeholder="What could be improved?"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Additional Comments</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share any other thoughts..."
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                    rows={3}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewForm.isSenior}
                    onChange={(e) => setReviewForm({ ...reviewForm, isSenior: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-foreground">I am a senior (optional)</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Submit Review
                  </Button>
                  <Button type="button" onClick={() => setShowReviewForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4 sticky top-24">
              <div className="flex gap-3">
                <Button
                  onClick={handleMarkComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Mark as Complete
                </Button>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                Pay Now
              </Button>

              {user.cgpa >= course.min_cgpa ? (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    You are eligible for this course
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-center">
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    You need CGPA {course.min_cgpa} to enroll
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors"
                >
                  Visit Course →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
