"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { requestNotificationPermission, scheduleGoalNotifications } from "@/lib/firebase/notifications"
import { getUserSettings } from "@/lib/firebase/firestore"

export function NotificationInitializer() {
  const { data: session } = useSession()

  useEffect(() => {
    async function initializeNotifications() {
      if (!session?.user?.id) return

      try {
        // Check if notifications are enabled for this user
        const settings = await getUserSettings(session.user.id)

        if (settings.enableNotifications) {
          // Request permission if needed
          if (Notification.permission !== "granted") {
            await requestNotificationPermission()
          }

          // Schedule notifications for today's goals
          await scheduleGoalNotifications(session.user.id)
        }
      } catch (error) {
        console.error("Error initializing notifications:", error)
      }
    }

    initializeNotifications()
  }, [session])

  return null
}
