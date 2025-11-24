"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage } from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignUp) {
        if (!formData.name || !formData.email || !formData.password) {
          setError("All fields are required")
          setLoading(false)
          return
        }
        // Create new user
        const newUser = {
          user_id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          cgpa: 0,
          interests: [],
        }
        storage.setUser(newUser)
        router.push("/profile-setup")
      } else {
        if (!formData.email || !formData.password) {
          setError("Email and password are required")
          setLoading(false)
          return
        }
        // Simulate login - in real app would verify with backend
        const user = storage.getUser()
        if (!user) {
          setError("User not found. Please sign up first.")
          setLoading(false)
          return
        }
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">CR</span>
          </div>
          <span className="text-2xl font-bold text-foreground">CourseRec</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? "Sign up to get personalized course recommendations" : "Log in to your account to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2"
            >
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setFormData({ name: "", email: "", password: "" })
                }}
                className="text-primary hover:underline font-semibold"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
