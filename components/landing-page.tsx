"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center">
          <Clock className="h-6 w-6 mr-2" />
          <span className="font-bold">Tomorrow Tracker</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
            Register
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Plan Today for a Better Tomorrow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Set small daily goals, track your progress, and build lasting habits with Tomorrow Tracker.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <CheckCircle className="h-10 w-10 text-primary" />
                    <h3 className="text-lg font-semibold">Daily Goal Setting</h3>
                    <p className="text-sm text-muted-foreground">
                      Set specific goals for tomorrow, with optional time reminders.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <Clock className="h-10 w-10 text-primary" />
                    <h3 className="text-lg font-semibold">Smart Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Get reminders before your scheduled goals and nightly prompts.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <Calendar className="h-10 w-10 text-primary" />
                    <h3 className="text-lg font-semibold">Daily Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Check off completed goals and build a history of achievements.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 rounded-lg border p-4">
                    <TrendingUp className="h-10 w-10 text-primary" />
                    <h3 className="text-lg font-semibold">Progress Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your streaks and see your goal completion rates over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tomorrow Tracker. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
