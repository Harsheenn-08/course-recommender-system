"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { storage, type User } from "@/lib/storage"
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
  avg_rating: number
  rating_count: number
}

interface Basket {
  basket_id: string
  basket_name: string
  description: string
  avg_rating: number
  rating_count: number
  courses: Array<{
    course_id: string
    course_no: string
    name: string
    l: number
    t: number
    p: number
    credits: number
  }>
}

export default function ElectivesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [generalElectives, setGeneralElectives] = useState<GeneralElective[]>([])
  const [baskets, setBaskets] = useState<Basket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
      setGeneralElectives(data.general_electives || [])
      setBaskets(data.basket_electives || [])
    } catch (err) {
      console.error("Error loading electives:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredGeneralElectives = generalElectives.filter(
    (e) =>
      (e.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (e.course_no?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  )

  const filteredBaskets = baskets.filter((basket) => {
    const basketNameMatch = (basket.basket_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const courseMatch = basket.courses?.some(
      (course) =>
        (course.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (course.course_no?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    )
    return basketNameMatch || courseMatch
  })

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

        <div className="bg-card rounded-xl border border-border p-6 mb-12">
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Search Electives</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, course number, or basket..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          <p className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredGeneralElectives.length} general electives and {filteredBaskets.length} baskets
            </span>
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-muted-foreground">Loading electives...</div>
          </div>
        )}

        {/* General Electives Section */}
        {!loading && (
          <div className="mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">General Electives</h2>
              <p className="text-muted-foreground">Single semester courses across various disciplines</p>
            </div>

            {filteredGeneralElectives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGeneralElectives.map((elective) => (
                  <GeneralElectiveCard
                    key={elective.elective_id}
                    elective={elective}
                    onViewDetails={() => {
                      router.push(`/electives/${elective.elective_id}`)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">No general electives found matching your search</p>
              </div>
            )}
          </div>
        )}

        {/* Basket Electives Section */}
        {!loading && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Electives (Basket System)</h2>
              <p className="text-muted-foreground">4-5 subjects per basket continuing over multiple semesters</p>
            </div>

            {filteredBaskets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBaskets.map((basket) => (
                  <BasketCard
                    key={basket.basket_id}
                    basket={basket}
                    onViewBasket={() => {
                      router.push(`/electives/basket/${basket.basket_id}`)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">No basket electives found matching your search</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredGeneralElectives.length === 0 && filteredBaskets.length === 0 && searchQuery && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No electives found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </main>
    </div>
  )
}

interface GeneralElectiveCardProps {
  elective: GeneralElective
  onViewDetails: () => void
}

function GeneralElectiveCard({ elective, onViewDetails }: GeneralElectiveCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <span className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded">
              {elective.course_no}
            </span>
            <h3 className="text-lg font-bold text-foreground mt-2 line-clamp-2">{elective.name}</h3>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
            <span>⭐</span>
            <span className="text-yellow-700 dark:text-yellow-300">{(elective.avg_rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>L: {elective.l}</span>
          <span>T: {elective.t}</span>
          <span>P: {elective.p}</span>
          <span className="font-semibold text-foreground">{elective.credits} Credits</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">{elective.description}</p>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">{elective.rating_count ?? 0}</p>
            <p className="text-xs">Senior Reviews</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={onViewDetails} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details & Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}

interface BasketCardProps {
  basket: Basket
  onViewBasket: () => void
}

function BasketCard({ basket, onViewBasket }: BasketCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-6">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-2">{basket.basket_name}</h3>
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-sm font-semibold whitespace-nowrap">
            <span>⭐</span>
            <span className="text-yellow-700 dark:text-yellow-300">{(basket.avg_rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{basket.courses?.length || 0} subjects in this basket</p>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">{basket.description}</p>

        <div className="bg-background/50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Subjects included:</p>
          {basket.courses?.slice(0, 4).map((course) => (
            <div key={course.course_id} className="flex justify-between items-center text-sm">
              <span className="text-foreground">{course.name}</span>
              <span className="text-xs text-muted-foreground">{course.course_no}</span>
            </div>
          ))}
          {basket.courses?.length > 4 && (
            <p className="text-xs text-muted-foreground italic">+{basket.courses.length - 4} more...</p>
          )}
        </div>

        <div className="flex justify-between text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground">{basket.rating_count ?? 0}</p>
            <p className="text-xs">Senior Reviews</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button onClick={onViewBasket} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Basket & Reviews
          </Button>
        </div>
      </div>
    </div>
  )
}
