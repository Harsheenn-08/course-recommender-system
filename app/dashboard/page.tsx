"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { storage, type User } from "@/lib/storage"
import Navigation from "@/components/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
      setLoading(false)
    }
  }, [router])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h1>
          <p className="text-lg text-muted-foreground">
            Your current CGPA: <span className="font-semibold text-primary">{user.cgpa.toFixed(2)}</span> • Interests:{" "}
            <span className="font-semibold text-primary">{user.interests.join(", ")}</span>
          </p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recommended Courses Card */}
          <Link href="/courses">
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Explore Recommended Courses</h2>
              <p className="text-muted-foreground mb-6">
                Get personalized course recommendations based on your CGPA and interests from our extensive catalog.
              </p>
              <div className="flex items-center text-primary font-semibold">Browse Courses →</div>
            </div>
          </Link>

          {/* College Electives Card */}
          <Link href="/electives">
            <div className="bg-card rounded-xl border border-border p-8 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                <span className="text-2xl">⭐</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">View College Electives</h2>
              <p className="text-muted-foreground mb-6">
                Explore college electives with ratings and reviews from your seniors who've taken them.
              </p>
              <div className="flex items-center text-accent font-semibold">View Electives →</div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <p className="text-muted-foreground">Courses Completed</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
            <div className="text-3xl font-bold text-accent mb-2">0</div>
            <p className="text-muted-foreground">Reviews Submitted</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-2">{user.interests.length}</div>
            <p className="text-muted-foreground">Interest Areas</p>
          </div>
        </div>
      </main>
    </div>
  )
}
