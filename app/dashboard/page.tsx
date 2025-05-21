import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { format } from "date-fns"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DailyGoals } from "@/components/daily-goals"
import { ProgressStats } from "@/components/progress-stats"
import { NotificationInitializer } from "@/components/notification-initializer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Clock, Calendar, Trophy, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  console.log('Dashboard page - getting server session...')
  const session = await getServerSession(authOptions)
  console.log('Dashboard page - session:', JSON.stringify(session, null, 2))

  if (!session) {
    console.log('No session found, redirecting to login')
    redirect("/login")
  }

  const today = new Date()
  const greeting = getTimeBasedGreeting()

  function getTimeBasedGreeting() {
    const hour = today.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <NotificationInitializer />
      <DashboardHeader />
      
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {session.user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Set Tomorrow's Goals</h3>
                <p className="text-sm text-muted-foreground">Plan your next day</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">View Calendar</h3>
                <p className="text-sm text-muted-foreground">See your schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">Your Streak</h3>
                <p className="text-sm text-muted-foreground">Keep it going!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DailyGoals />
        </div>
        <div className="space-y-6">
          <ProgressStats />
          
          {/* Quick Tips Card */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Quick Tips
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>Set your goals for tomorrow before bed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>Be specific with your goals to increase success</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-muted-foreground mr-2">•</span>
                    <span>Review your progress at the end of each week</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
