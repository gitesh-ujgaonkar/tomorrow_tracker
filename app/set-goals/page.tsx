import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GoalForm } from "@/components/goal-form"

export default async function SetGoalsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Set Tomorrow's Goals</h1>
        <p className="text-muted-foreground">Plan your goals for tomorrow to stay on track</p>
      </div>
      <GoalForm />
    </div>
  )
}
