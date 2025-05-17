"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CheckCircle, Trophy } from "lucide-react"
import { type Goal, getGoalsByDateRange, getUserStreak } from "@/lib/firebase/firestore"

export function ProgressStats() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([])
  const [streak, setStreak] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Calculate date ranges
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Sunday
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return

      try {
        // Fetch weekly goals
        const startDate = format(weekStart, "yyyy-MM-dd")
        const endDate = format(weekEnd, "yyyy-MM-dd")
        const goals = await getGoalsByDateRange(session.user.id, startDate, endDate)
        setWeeklyGoals(goals)

        // Fetch user streak
        const userStreak = await getUserStreak(session.user.id)
        setStreak(userStreak)
      } catch (error) {
        console.error("Error fetching progress data:", error)
        toast({
          title: "Error",
          description: "Failed to load progress data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, toast])

  // Calculate completion rates
  const calculateDailyCompletionRate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const dayGoals = weeklyGoals.filter((goal) => goal.date === dateString)

    if (dayGoals.length === 0) return 0

    const completedGoals = dayGoals.filter((goal) => goal.completed)
    return (completedGoals.length / dayGoals.length) * 100
  }

  const calculateWeeklyCompletionRate = () => {
    if (weeklyGoals.length === 0) return 0

    const completedGoals = weeklyGoals.filter((goal) => goal.completed)
    return (completedGoals.length / weeklyGoals.length) * 100
  }

  const weeklyCompletionRate = calculateWeeklyCompletionRate()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="text-center">
              <p className="text-3xl font-bold">{streak || 0}</p>
              <p className="text-sm text-muted-foreground">consecutive days</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Weekly Completion
          </CardTitle>
          <CardDescription>
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{Math.round(weeklyCompletionRate)}% complete</span>
              </div>
              <Progress value={weeklyCompletionRate} className="h-2" />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            Daily Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {daysOfWeek.map((day) => {
                const completionRate = calculateDailyCompletionRate(day)
                const isToday = isSameDay(day, today)

                return (
                  <div key={day.toString()} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isToday ? "font-bold" : ""}`}>{format(day, "EEE")}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(completionRate)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-1.5" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
