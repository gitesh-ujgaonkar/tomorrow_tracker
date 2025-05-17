import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DailyGoals } from "@/components/daily-goals"
import { ProgressStats } from "@/components/progress-stats"
import { NotificationInitializer } from "@/components/notification-initializer"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <NotificationInitializer />
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DailyGoals />
        </div>
        <div>
          <ProgressStats />
        </div>
      </div>
    </div>
  )
}
