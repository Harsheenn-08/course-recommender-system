"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage, type User } from "@/lib/storage"
import Navigation from "@/components/navigation"
import { getCourseById } from "@/lib/api"

type PaymentMethod = "upi" | "bank" | "card" | null

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course_id")

  const [user, setUser] = useState<User | null>(null)
  const [courseTitle, setCourseTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)

  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  })

  useEffect(() => {
    const currentUser = storage.getUser()
    if (!currentUser) {
      router.push("/login")
      return
    }
    setUser(currentUser)

    if (courseId) {
      getCourseById(courseId).then((course) => {
        if (course) {
          setCourseTitle(course.title)
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [router, courseId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (user && courseId) {
      storage.addInteraction({
        user_id: user.user_id,
        course_id: courseId,
        event_type: "payment_completed",
        details: `Payment successful via ${selectedMethod?.toUpperCase()} for ${courseTitle}`,
        created_at: new Date().toISOString(),
      })
    }

    setProcessing(false)

    // Show success message and redirect
    alert("Payment Successful! Redirecting to your dashboard...")
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Complete Payment</h1>
          <p className="text-lg text-muted-foreground">Secure payment processing for course enrollment</p>
        </div>

        {/* Payment Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-8">
          {/* Course Info */}
          {courseTitle && (
            <div className="mb-8 pb-8 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">Enrolling in</p>
              <h2 className="text-2xl font-bold text-foreground">{courseTitle}</h2>
            </div>
          )}

          {!selectedMethod ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground mb-6">Select Payment Method</p>

              <button
                onClick={() => setSelectedMethod("upi")}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">UPI Payment</p>
                    <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod("card")}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0m-10 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0M3 5a2 2 0 012-2h14a2 2 0 012 2v2H3V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod("bank")}
                className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Bank Transfer</p>
                    <p className="text-sm text-muted-foreground">Direct bank account transfer</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <button
                  type="button"
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-primary hover:underline mb-4"
                >
                  ← Change Payment Method
                </button>

                {selectedMethod === "upi" && (
                  <div>
                    <label htmlFor="upiId" className="block text-sm font-semibold text-foreground mb-2">
                      UPI ID
                    </label>
                    <Input
                      id="upiId"
                      name="upiId"
                      type="text"
                      value={formData.upiId}
                      onChange={handleChange}
                      placeholder="yourname@upi"
                      required
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">e.g., yourname@googlepay, yourname@okhdfcbank</p>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <>
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-semibold text-foreground mb-2">
                        Name on Card
                      </label>
                      <Input
                        id="cardName"
                        name="cardName"
                        type="text"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-semibold text-foreground mb-2">
                        Card Number
                      </label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-semibold text-foreground mb-2">
                          Expiry Date
                        </label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-semibold text-foreground mb-2">
                          CVV
                        </label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="4"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === "bank" && (
                  <>
                    <div>
                      <label htmlFor="bankName" className="block text-sm font-semibold text-foreground mb-2">
                        Bank Name
                      </label>
                      <Input
                        id="bankName"
                        name="bankName"
                        type="text"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="HDFC Bank"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-semibold text-foreground mb-2">
                        Account Number
                      </label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        placeholder="1234567890123456"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="ifscCode" className="block text-sm font-semibold text-foreground mb-2">
                        IFSC Code
                      </label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        type="text"
                        value={formData.ifscCode}
                        onChange={handleChange}
                        placeholder="HDFC0001234"
                        required
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    This is a demo payment form. No actual charges will be made.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-lg"
                >
                  {processing ? "Processing Payment..." : "Pay Now"}
                </Button>

                <Button type="button" onClick={() => router.back()} variant="outline" className="w-full">
                  Cancel
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">Your payment information is secure and encrypted</p>
        </div>
      </main>
    </div>
  )
}
