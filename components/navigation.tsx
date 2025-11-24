"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/storage"

interface NavigationProps {
  user: User
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("courses")
    localStorage.removeItem("reviews")
    localStorage.removeItem("interactions")
    router.push("/")
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CR</span>
            </div>
            <span className="font-bold text-foreground hidden sm:inline">CourseRec</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant={isActive("/dashboard") ? "default" : "ghost"} className="text-foreground">
                Dashboard
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant={isActive("/courses") ? "default" : "ghost"} className="text-foreground">
                Courses
              </Button>
            </Link>
            <Link href="/electives">
              <Button variant={isActive("/electives") ? "default" : "ghost"} className="text-foreground">
                Electives
              </Button>
            </Link>
            <Link href="/my-reviews">
              <Button variant={isActive("/my-reviews") ? "default" : "ghost"} className="text-foreground">
                My Reviews
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant={isActive("/profile") ? "default" : "ghost"} className="text-foreground">
                Profile
              </Button>
            </Link>
          </div>

          {/* Logout */}
          <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
