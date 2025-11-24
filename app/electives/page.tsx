"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { storage, type User } from "@/lib/storage"
import Navigation from "@/components/navigation"

interface Elective {
  elective_id: string
  name: string
  semester: string
  department: string
  description: string
  avg_rating: number
  rating_count: number
}

export default function ElectivesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [electives, setElectives] = useState<Elective[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    loadElectives()
  }, [router])

  const loadElectives = async () => {
    try {
      const response = await fetch("/data/electives.json")
      const data = await response.json()
      setElectives(data.electives)
    } catch (err) {
      console.error("Error loading electives:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = electives.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchSemester = !selectedSemester || e.semester === selectedSemester
    return matchSearch && matchSemester
  })

  const semesters = ["6th", "7th"]

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">College Electives</h1>
          <p className="text-lg text-muted-foreground">Explore electives with senior reviews and ratings</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search Electives</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or department..."
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
              <select
                value={selectedSemester || ""}
                onChange={(e) => setSelectedSemester(e.target.value || null)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="">All Semesters</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem} Semester
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> electives
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">Loading electives...</div>
          </div>
        )}

        {/* Electives Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((elective) => (
              <ElectiveCard
                key={elective.elective_id}
                elective={elective}
                onViewReviews={() => {
                  router.push(`/electives/${elective.elective_id}`)
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No electives found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </div>
  )
}

interface ElectiveCardProps {
  elective: Elective
  onViewReviews: () => void
}

function ElectiveCard({ elective, onViewReviews }: ElectiveCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-bold text-foreground line-clamp-2">{elective.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
            <span>⭐</span>
            <span className="text-yellow-700 dark:text-yellow-300">{elective.avg_rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{elective.department}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
          {elective.semester} Semester
        </span>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">{elective.description}</p>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">{elective.rating_count}</p>
            <p className="text-xs">Senior Reviews</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={onViewReviews} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}
