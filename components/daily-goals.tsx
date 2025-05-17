"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash } from "lucide-react"
import { type Goal, getGoalsByDate, updateGoal, deleteGoal } from "@/lib/firebase/firestore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DailyGoals() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    async function fetchGoals() {
      if (!session?.user?.id) return

      try {
        const todayGoals = await getGoalsByDate(session.user.id, today)
        setGoals(todayGoals)
      } catch (error) {
        console.error("Error fetching goals:", error)
        toast({
          title: "Error",
          description: "Failed to load today's goals",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [session, today, toast])

  const handleToggleComplete = async (goal: Goal) => {
    try {
      const updatedGoal = { ...goal, completed: !goal.completed }
      await updateGoal(updatedGoal)

      setGoals(goals.map((g) => (g.id === goal.id ? updatedGoal : g)))

      toast({
        title: goal.completed ? "Goal marked as incomplete" : "Goal completed!",
        description: goal.text,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      setGoals(goals.filter((g) => g.id !== goalId))

      toast({
        title: "Goal deleted",
        description: "The goal has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Goals</CardTitle>
        <CardDescription>{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No goals set for today</p>
            <Button className="mt-4" variant="outline" onClick={() => (window.location.href = "/set-goals")}>
              Set Goals for Tomorrow
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  goal.completed ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={goal.id}
                    checked={goal.completed}
                    onCheckedChange={() => handleToggleComplete(goal)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor={goal.id}
                      className={`font-medium ${goal.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {goal.text}
                    </label>
                    {goal.hasTime && goal.time && (
                      <p className="text-sm text-muted-foreground">Scheduled for: {goal.time}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/edit-goal/${goal.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this goal? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
