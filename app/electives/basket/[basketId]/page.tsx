"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { storage, type User, type Review } from "@/lib/storage"
import Navigation from "@/components/navigation"

interface Course {
  elective_id: string
  course_no: string
  name: string
  l: number
  t: number
  p: number
  credits: number
  description?: string
  avg_rating?: number
}

interface Basket {
  basket_id: string
  basket_name: string
  description: string
  avg_rating: number
  rating_count: number
  courses: Course[]
  reviews?: any[]
}

export default function BasketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const basketId = params.basketId as string

  const [user, setUser] = useState<User | null>(null)
  const [basket, setBasket] = useState<Basket | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [pros, setPros] = useState("")
  const [cons, setCons] = useState("")
  const [comments, setComments] = useState("")

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadBasket()
  }, [basketId, router])

  const loadBasket = async () => {
    try {
      const response = await fetch("/data/electives.json")
      const data = await response.json()
      const foundBasket = data.basket_electives?.find((b: Basket) => b.basket_id === basketId)

      if (!foundBasket) {
        router.push("/electives")
        return
      }

      setBasket(foundBasket)

      const localReviews = storage.getReviews().filter((r) => r.course_id === basketId)

      // Convert JSON reviews to Review format
      const jsonReviews: Review[] = (foundBasket.reviews || []).map((r: any, idx: number) => ({
        review_id: `json_${basketId}_${idx}`,
        course_id: basketId,
        reviewer_name: r.user,
        rating: r.rating,
        pros: r.pros || "",
        cons: r.cons || "",
        comment: r.comment || "",
        is_senior: true,
        created_at: r.date ? new Date(r.date).toISOString() : new Date().toISOString(),
      }))

      // Merge JSON reviews with user-submitted reviews
      setReviews([...jsonReviews, ...localReviews])
    } catch (err) {
      console.error("Error loading basket:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = () => {
    if (!user || !basket) return

    const review: Review = {
      review_id: `review_${Date.now()}`,
      course_id: basketId,
      reviewer_name: user.name,
      rating,
      pros,
      cons,
      comment: comments,
      is_senior: true,
      created_at: new Date().toISOString(),
    }

    storage.addReview(review)
    setReviews([review, ...reviews])
    setShowReviewForm(false)
    setRating(5)
    setPros("")
    setCons("")
    setComments("")
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return basket?.avg_rating || 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / reviews.length
  }

  if (loading || !basket) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center py-20">
          <div className="text-muted-foreground">Loading basket...</div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.push("/electives")} className="mb-6">
          ← Back to Electives
        </Button>

        {/* Basket Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full">BASKET</span>
              <h1 className="text-4xl font-bold text-foreground mt-3">{basket.basket_name}</h1>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {calculateAverageRating().toFixed(1)}
              </span>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-6">{basket.description}</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground text-lg">{basket.courses.length}</span>
              <span className="ml-2">Subjects</span>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">{reviews.length}</span>
              <span className="ml-2">Reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subjects in Basket */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Subjects in this Basket</h2>
              <div className="space-y-4">
                {basket.courses.map((course) => (
                  <div
                    key={course.elective_id}
                    onClick={() => router.push(`/electives/basket/${basketId}/subject/${course.elective_id}`)}
                    className="bg-background/50 rounded-lg p-4 hover:bg-background border border-border hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded">
                          {course.course_no}
                        </span>
                        <h3 className="text-lg font-bold text-foreground mt-2">{course.name}</h3>
                      </div>
                      {course.avg_rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span>⭐</span>
                          <span className="font-semibold">{course.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>L: {course.l}</span>
                      <span>T: {course.t}</span>
                      <span>P: {course.p}</span>
                      <span className="font-semibold text-foreground">{course.credits} Credits</span>
                    </div>
                    {course.description && <p className="text-sm text-muted-foreground mt-3">{course.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Senior Reviews for this Basket</h2>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {showReviewForm ? "Cancel" : "Write Review"}
                </Button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-background/50 rounded-lg p-6 mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setRating(star)
                          }}
                          className={`text-3xl transition-all hover:scale-110 cursor-pointer ${
                            star <= rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {rating} star{rating !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Pros</label>
                    <textarea
                      value={pros}
                      onChange={(e) => setPros(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground min-h-[80px]"
                      placeholder="What did you like about this basket?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Cons</label>
                    <textarea
                      value={cons}
                      onChange={(e) => setCons(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground min-h-[80px]"
                      placeholder="What could be improved?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Additional Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground min-h-[80px]"
                      placeholder="Any other thoughts?"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Submit Review
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.review_id} className="bg-background/50 rounded-lg p-6 border border-border">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded">
                          <span>⭐</span>
                          <span className="font-semibold text-yellow-700 dark:text-yellow-300">{review.rating}</span>
                        </div>
                      </div>
                      {review.pros && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">Pros:</p>
                          <p className="text-sm text-muted-foreground">{review.pros}</p>
                        </div>
                      )}
                      {review.cons && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">Cons:</p>
                          <p className="text-sm text-muted-foreground">{review.cons}</p>
                        </div>
                      )}
                      {review.comment && (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Comments:</p>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this basket!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Basket Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Subjects:</span>
                  <span className="font-semibold text-foreground">{basket.courses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Rating:</span>
                  <span className="font-semibold text-foreground">{calculateAverageRating().toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Reviews:</span>
                  <span className="font-semibold text-foreground">{reviews.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
