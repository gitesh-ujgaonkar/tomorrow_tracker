import { messaging } from "./config"
import { getToken, onMessage } from "firebase/messaging"
import { format } from "date-fns"
import { getUserSettings, getGoalsByDate } from "./firestore"

// Request permission and get FCM token
export async function requestNotificationPermission() {
  try {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported in this browser")
    }

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      // Get FCM token if Firebase messaging is available
      if (messaging) {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })
        return token
      }
      return "local-notifications-only"
    } else {
      throw new Error("Notification permission denied")
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error)
    throw error
  }
}

// Set up foreground message handler
export function setupMessageHandler(callback: (payload: any) => void) {
  if (!messaging) {
    console.error("Firebase messaging is not initialized")
    return
  }

  return onMessage(messaging, (payload) => {
    callback(payload)
  })
}

// Schedule local notification
export function scheduleLocalNotification(title: string, body: string, timestamp: number) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.error("Notifications not supported or permission not granted")
    return
  }

  const now = Date.now()
  const delay = timestamp - now

  if (delay <= 0) {
    return
  }

  return setTimeout(() => {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
    })
  }, delay)
}

// Schedule notifications for a user's goals
export async function scheduleGoalNotifications(userId: string) {
  try {
    // Check if notifications are enabled
    const settings = await getUserSettings(userId)

    if (!settings.enableNotifications) {
      return
    }

    // Get today's goals
    const today = format(new Date(), "yyyy-MM-dd")
    const goals = await getGoalsByDate(userId, today)

    // Schedule notifications for time-based goals
    if (settings.enableTimeBasedAlerts) {
      for (const goal of goals) {
        if (goal.hasTime && goal.time && !goal.completed) {
          const [hours, minutes] = goal.time.split(":").map(Number)

          // Create a Date object for the goal time
          const goalTime = new Date()
          goalTime.setHours(hours, minutes, 0, 0)

          // Only schedule if the time is in the future
          if (goalTime.getTime() > Date.now()) {
            // 30 minutes before
            const thirtyMinBefore = new Date(goalTime.getTime() - 30 * 60 * 1000)
            if (thirtyMinBefore.getTime() > Date.now()) {
              scheduleLocalNotification(
                "Goal Reminder",
                `Your goal "${goal.text}" is scheduled in 30 minutes`,
                thirtyMinBefore.getTime(),
              )
            }

            // 5 minutes before
            const fiveMinBefore = new Date(goalTime.getTime() - 5 * 60 * 1000)
            if (fiveMinBefore.getTime() > Date.now()) {
              scheduleLocalNotification(
                "Goal Reminder",
                `Your goal "${goal.text}" is scheduled in 5 minutes`,
                fiveMinBefore.getTime(),
              )
            }
          }
        }
      }
    }

    // Schedule evening reminder to set tomorrow's goals
    if (settings.reminderTime) {
      const [reminderHours, reminderMinutes] = settings.reminderTime.split(":").map(Number)

      // Create a Date object for the reminder time
      const reminderTime = new Date()
      reminderTime.setHours(reminderHours, reminderMinutes, 0, 0)

      // If the time has already passed today, schedule for tomorrow
      if (reminderTime.getTime() <= Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1)
      }

      scheduleLocalNotification(
        "Set Tomorrow's Goals",
        "It's time to plan your goals for tomorrow!",
        reminderTime.getTime(),
      )
    }

    return true
  } catch (error) {
    console.error("Error scheduling notifications:", error)
    throw error
  }
}
