"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage, type User } from "@/lib/storage"
import Navigation from "@/components/navigation"

const INTERESTS = [
  "AI",
  "ML",
  "Web Development",
  "Cybersecurity",
  "Finance",
  "Data Science",
  "Cloud Computing",
  "IoT",
  "Blockchain",
  "UI/UX",
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cgpa: 0,
    interests: [] as string[],
  })

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)
    setFormData({
      name: currentUser.name,
      email: currentUser.email,
      cgpa: currentUser.cgpa,
      interests: [...currentUser.interests],
    })
    setLoading(false)
  }, [router])

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email) {
      setError("Name and email are required")
      return
    }

    if (formData.cgpa < 0 || formData.cgpa > 10) {
      setError("CGPA must be between 0 and 10")
      return
    }

    if (formData.interests.length === 0) {
      setError("Please select at least one interest")
      return
    }

    const updatedUser: User = {
      user_id: user?.user_id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      cgpa: formData.cgpa,
      interests: formData.interests,
    }

    storage.setUser(updatedUser)
    setUser(updatedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        cgpa: user.cgpa,
        interests: [...user.interests],
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-lg text-muted-foreground">Manage your academic profile and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-8">
          {!isEditing ? (
            // View Mode
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-2xl font-bold text-foreground">{user.name}</p>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-lg font-semibold text-foreground">{user.email}</p>
              </div>

              <div className="border-t border-border pt-8">
                <p className="text-sm text-muted-foreground mb-1">Current CGPA</p>
                <p className="text-lg font-semibold text-foreground">{user.cgpa.toFixed(2)} / 10</p>
              </div>

              <div className="border-t border-border pt-8">
                <p className="text-sm text-muted-foreground mb-3">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-2 rounded-lg bg-primary/20 text-primary font-semibold text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="cgpa" className="block text-sm font-semibold text-foreground mb-2">
                  Current CGPA
                </label>
                <div className="relative">
                  <Input
                    id="cgpa"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: Number.parseFloat(e.target.value) || 0 })}
                    className="w-full pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">/10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Interests</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-3 rounded-lg font-medium transition-all border ${
                        formData.interests.includes(interest)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
                  {error}
                </div>
              )}

              <div className="border-t border-border pt-8 flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                >
                  Save Changes
                </Button>
                <Button type="button" onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
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
