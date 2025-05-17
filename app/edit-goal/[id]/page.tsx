import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { EditGoalForm } from "@/components/edit-goal-form"

export default async function EditGoalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
        <p className="text-muted-foreground">Update your goal details</p>
      </div>
      <EditGoalForm goalId={params.id} />
    </div>
  )
}
