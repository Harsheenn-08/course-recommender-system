"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  const handleScroll = () => {
    const element = document.getElementById("learn-more")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CR</span>
            </div>
            <span className="text-xl font-bold text-foreground">Course Recommender</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
                Discover the Best Courses for Your Future
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Get personalized course recommendations based on your CGPA, interests, and senior reviews. Find the
                perfect electives to boost your academic journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 text-foreground hover:bg-secondary w-full sm:w-auto bg-transparent"
                  onClick={handleScroll}
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right: Visual Element */}
            <div className="relative h-96 md:h-full hidden md:flex items-center justify-center">
              <div className="absolute w-80 h-80 bg-primary/20 rounded-full blur-3xl -top-20 -right-20" />
              <div className="absolute w-60 h-60 bg-accent/20 rounded-full blur-3xl bottom-10 left-10" />
              <div className="relative z-10 bg-card rounded-2xl p-8 shadow-lg border border-border">
                <div className="space-y-4">
                  <div className="h-3 w-24 bg-primary/30 rounded" />
                  <div className="h-2 w-32 bg-muted rounded" />
                  <div className="h-2 w-28 bg-muted rounded" />
                  <div className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <div className="h-2 flex-1 bg-primary/20 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <div className="h-2 w-20 bg-primary/20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" className="py-20 md:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our intelligent recommendation system helps you choose the right courses based on your academic profile
              and interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and tell us your CGPA and academic interests. This helps us understand your learning level and
                preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Our ML model analyzes thousands of courses and suggests the perfect matches for your profile in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-background rounded-xl p-8 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Read Reviews & Enroll</h3>
              <p className="text-muted-foreground">
                Check senior reviews, ratings, and detailed course info before making your decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to make informed course decisions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Smart Filtering</h3>
                  <p className="text-muted-foreground">
                    Filter courses by difficulty, provider, duration, and eligibility criteria.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <span className="text-lg">⭐</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Senior Reviews</h3>
                  <p className="text-muted-foreground">
                    Read honest feedback from seniors who have completed the courses.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">💳</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Easy Enrollment</h3>
                  <p className="text-muted-foreground">Streamlined enrollment process with payment integration.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">🔍</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Search</h3>
                  <p className="text-muted-foreground">Find courses by title, provider, tags, or learning outcomes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">Keep track of completed courses and certifications.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">🤖</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered</h3>
                  <p className="text-muted-foreground">
                    Machine learning model that improves recommendations over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Find Your Perfect Courses?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of students making smarter course decisions.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-muted-foreground text-sm">
              © 2025 Course Recommender System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
