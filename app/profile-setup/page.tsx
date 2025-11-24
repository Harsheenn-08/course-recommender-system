"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage } from "@/lib/storage"

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

export default function ProfileSetupPage() {
  const router = useRouter()
  const [user, setUser] = useState(storage.getUser())
  const [cgpa, setCgpa] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!cgpa || Number.parseFloat(cgpa) < 0 || Number.parseFloat(cgpa) > 10) {
      setError("Please enter a valid CGPA between 0 and 10")
      return
    }

    if (interests.length === 0) {
      setError("Please select at least one interest")
      return
    }

    setLoading(true)

    try {
      if (user) {
        const updatedUser = {
          ...user,
          cgpa: Number.parseFloat(cgpa),
          interests,
        }
        storage.setUser(updatedUser)
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }

    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Complete Your Profile</h1>
          <p className="text-lg text-muted-foreground">
            Help us understand your academic profile to provide better recommendations
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Welcome */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome, {user.name}!</h2>
              <p className="text-muted-foreground">
                Let's get your profile set up so we can recommend the perfect courses for you.
              </p>
            </div>

            {/* CGPA Input */}
            <div>
              <label htmlFor="cgpa" className="block text-lg font-semibold text-foreground mb-3">
                Your Current CGPA
              </label>
              <div className="relative">
                <Input
                  id="cgpa"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="7.50"
                  className="w-full text-lg p-3"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">/10</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This helps us show courses that match your academic level
              </p>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-4">Select Your Interests</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all border ${
                      interests.includes(interest)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">Select at least one interest area</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">{error}</div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
            >
              {loading ? "Saving..." : "Continue to Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
