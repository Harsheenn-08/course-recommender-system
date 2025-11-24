"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { storage, type User, type Review } from "@/lib/storage"
import Navigation from "@/components/navigation"

export default function MyReviewsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Review | null>(null)

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadMyReviews()
  }, [router])

  const loadMyReviews = async () => {
    const allReviews = storage.getReviews()
    if (user) {
      const myReviews = allReviews.filter((r) => r.reviewer_name === user.name)
      setReviews(myReviews)
    }
    setLoading(false)
  }

  const handleDeleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.review_id !== reviewId)
    setReviews(updated)

    // Update localStorage
    const allReviews = storage.getReviews()
    const filtered = allReviews.filter((r) => r.review_id !== reviewId)
    localStorage.setItem("reviews", JSON.stringify(filtered))
  }

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.review_id)
    setEditForm({ ...review })
  }

  const handleSaveEdit = (reviewId: string) => {
    if (!editForm) return

    const updated = reviews.map((r) => (r.review_id === reviewId ? editForm : r))
    setReviews(updated)

    // Update localStorage
    const allReviews = storage.getReviews()
    const filtered = allReviews.map((r) => (r.review_id === reviewId ? editForm : r))
    localStorage.setItem("reviews", JSON.stringify(filtered))

    setEditingReviewId(null)
    setEditForm(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Reviews</h1>
          <p className="text-lg text-muted-foreground">Manage all your submitted course and elective reviews</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">Loading your reviews...</div>
          </div>
        )}

        {/* Reviews List */}
        {!loading && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.review_id} className="bg-card rounded-xl border border-border p-8">
                {editingReviewId === review.review_id && editForm ? (
                  // Edit Mode
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-foreground">Edit Review</h3>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, rating: star })}
                            className={`text-3xl transition-all ${
                              star <= editForm.rating ? "text-yellow-500" : "text-gray-300"
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
                        value={editForm.pros}
                        onChange={(e) => setEditForm({ ...editForm, pros: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Cons</label>
                      <textarea
                        value={editForm.cons}
                        onChange={(e) => setEditForm({ ...editForm, cons: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Comment</label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSaveEdit(review.review_id)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingReviewId(null)
                          setEditForm(null)
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-foreground text-lg">Course ID: {review.course_id}</p>
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

                    <div className="space-y-3 mb-6">
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

                    {review.is_senior && (
                      <div className="mb-4 inline-block px-3 py-1 rounded bg-accent/20 text-accent text-sm font-semibold">
                        Senior Review
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => handleEditClick(review)}
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteReview(review.review_id)}
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-6">Start reviewing courses and electives to share your experience</p>
            <Link href="/courses">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Courses</Button>
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  )
}
