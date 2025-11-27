"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { storage, type User, type Review } from "@/lib/storage"
import Navigation from "@/components/navigation"

interface GeneralElective {
  elective_id: string
  course_no: string
  name: string
  l: number
  t: number
  p: number
  credits: number
  description: string
  objectives?: string[]
  topics?: string[]
  outcomes?: string[]
  books?: string[]
  evaluation?: { MST: number; EST: number }
  avg_rating: number
  rating_count: number
  reviews?: any[]
}

interface BasketElective {
  elective_id: string
  name: string
  department: string
  description: string
  avg_rating: number
  rating_count: number
  reviews?: any[]
}

type Elective = GeneralElective | BasketElective

function isGeneralElective(elective: Elective): elective is GeneralElective {
  return "course_no" in elective
}

export default function ElectiveDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const electiveId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [elective, setElective] = useState<Elective | null>(null)
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
    loadElectiveDetails()
  }, [router, electiveId])

  const loadElectiveDetails = async () => {
    try {
      const response = await fetch("/data/electives.json")
      const data = await response.json()

      const foundGeneral = data.general_electives.find((e: GeneralElective) => e.elective_id === electiveId)
      const foundBasket = data.basket_electives.find((e: BasketElective) => e.elective_id === electiveId)
      const found = foundGeneral || foundBasket

      if (found) {
        setElective(found)

        const localReviews = storage.getReviews().filter((r) => r.course_id === electiveId)

        // Convert JSON reviews to Review format
        const jsonReviews: Review[] = (found.reviews || []).map((r: any, idx: number) => ({
          review_id: `json_${electiveId}_${idx}`,
          course_id: electiveId,
          reviewer_name: r.user,
          rating: r.rating,
          pros: r.pros || "",
          cons: r.cons || "",
          comment: r.comment || "",
          is_senior: true,
          created_at: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
        }))

        // Merge JSON reviews with user-submitted reviews
        const allReviews = [...jsonReviews, ...localReviews]
        setReviews(allReviews)

        if (allReviews.length > 0) {
          const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          setAvgRating(avg)
        } else {
          setAvgRating(found.avg_rating)
        }
      }
    } catch (err) {
      console.error("Error loading elective details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !elective) return

    const newReview: Review = {
      review_id: Date.now().toString(),
      course_id: electiveId,
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

    const newAvg = [...reviews, newReview].reduce((sum, r) => sum + r.rating, 0) / [...reviews, newReview].length
    setAvgRating(newAvg)

    setReviewForm({
      rating: 5,
      pros: "",
      cons: "",
      comment: "",
      isSenior: false,
    })
    setShowReviewForm(false)
  }

  if (!user) return null
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  if (!elective)
    return <div className="min-h-screen bg-background flex items-center justify-center">Elective not found</div>

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Elective Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8 border border-border">
          {isGeneralElective(elective) && (
            <div className="mb-4 flex gap-2 flex-wrap">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                {elective.course_no}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
                L-T-P: {elective.l}-{elective.t}-{elective.p} | Credits: {elective.credits}
              </span>
            </div>
          )}

          {!isGeneralElective(elective) && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
                {elective.department}
              </span>
            </div>
          )}

          <h1 className="text-4xl font-bold text-foreground mb-4">{elective.name}</h1>

          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-3xl font-bold text-yellow-600 mb-1 flex items-center gap-2">
                ⭐ {avgRating.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Description */}
          <section className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Course Description</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{elective.description}</p>
          </section>

          {isGeneralElective(elective) && (
            <>
              {/* Course Objectives */}
              {elective.objectives && elective.objectives.length > 0 && (
                <section className="bg-card rounded-xl p-8 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Course Objectives</h2>
                  <ul className="space-y-2">
                    {elective.objectives.map((obj, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span className="text-muted-foreground leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Course Topics */}
              {elective.topics && elective.topics.length > 0 && (
                <section className="bg-card rounded-xl p-8 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Topics Covered</h2>
                  <ul className="space-y-3">
                    {elective.topics.map((topic, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-accent font-bold mt-1">→</span>
                        <span className="text-muted-foreground leading-relaxed">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Course Learning Outcomes */}
              {elective.outcomes && elective.outcomes.length > 0 && (
                <section className="bg-card rounded-xl p-8 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Course Learning Outcomes</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upon completion of the course, students will be able to:
                  </p>
                  <ul className="space-y-2">
                    {elective.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-muted-foreground leading-relaxed">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Recommended Books */}
              {elective.books && elective.books.length > 0 && (
                <section className="bg-card rounded-xl p-8 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Recommended Books</h2>
                  <ul className="space-y-2">
                    {elective.books.map((book, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span className="text-muted-foreground leading-relaxed">{book}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Evaluation Scheme */}
              {elective.evaluation && (
                <section className="bg-card rounded-xl p-8 border border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-4">Evaluation Scheme</h2>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Mid-Semester Test</p>
                      <p className="text-3xl font-bold text-primary">{elective.evaluation.MST}%</p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">End-Semester Test</p>
                      <p className="text-3xl font-bold text-accent">{elective.evaluation.EST}%</p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* Senior Reviews */}
          <section className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Senior Reviews ({reviews.length})</h2>

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
              Add Senior Review
            </Button>
          ) : (
            <form onSubmit={handleSubmitReview} className="bg-card rounded-xl p-8 border border-border space-y-6">
              <h3 className="text-xl font-bold text-foreground">Share Your Review</h3>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setReviewForm({ ...reviewForm, rating: star })
                      }}
                      className={`text-4xl transition-all hover:scale-110 cursor-pointer ${
                        star <= reviewForm.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {reviewForm.rating} star{reviewForm.rating !== 1 ? "s" : ""}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Pros</label>
                <textarea
                  value={reviewForm.pros}
                  onChange={(e) => setReviewForm({ ...reviewForm, pros: e.target.value })}
                  placeholder="What did you like about this elective?"
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
      </main>
    </div>
  )
}
