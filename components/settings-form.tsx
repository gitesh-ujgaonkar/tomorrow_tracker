"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Bell, Clock } from "lucide-react"
import { getUserSettings, updateUserSettings } from "@/lib/firebase/firestore"
import { requestNotificationPermission } from "@/lib/firebase/notifications"

const formSchema = z.object({
  enableNotifications: z.boolean().default(true),
  reminderTime: z.string().default("21:00"), // Default to 9:00 PM
  enableTimeBasedAlerts: z.boolean().default(true),
})

export function SettingsForm() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enableNotifications: true,
      reminderTime: "21:00",
      enableTimeBasedAlerts: true,
    },
  })

  useEffect(() => {
    async function fetchSettings() {
      if (!session?.user?.id) return

      try {
        const settings = await getUserSettings(session.user.id)

        if (settings) {
          form.reset({
            enableNotifications: settings.enableNotifications,
            reminderTime: settings.reminderTime || "21:00",
            enableTimeBasedAlerts: settings.enableTimeBasedAlerts,
          })
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    fetchSettings()
  }, [session, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update settings",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // If enabling notifications, request permission
      if (values.enableNotifications && notificationPermission !== "granted") {
        try {
          await requestNotificationPermission()
          setNotificationPermission("granted")
        } catch (error) {
          console.error("Error requesting notification permission:", error)
          toast({
            title: "Permission Denied",
            description: "Notification permission was denied. Please enable notifications in your browser settings.",
            variant: "destructive",
          })
          form.setValue("enableNotifications", false)
          return
        }
      }

      await updateUserSettings(session.user.id, {
        enableNotifications: values.enableNotifications,
        reminderTime: values.reminderTime,
        enableTimeBasedAlerts: values.enableTimeBasedAlerts,
      })

      toast({
        title: "Success",
        description: "Your settings have been updated!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enableNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Notifications</FormLabel>
                      <FormDescription>Receive reminders for your goals</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={notificationPermission === "denied"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("enableNotifications") && (
                <>
                  <FormField
                    control={form.control}
                    name="reminderTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Evening Reminder Time</FormLabel>
                          <FormDescription>
                            When to remind you to set goals for tomorrow
                            <div className="flex items-center mt-1 text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Default: 9:00 PM
                            </div>
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="time"
                            className="flex h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableTimeBasedAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Time-Based Alerts</FormLabel>
                          <FormDescription>
                            Receive notifications 30 and 5 minutes before scheduled goals
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
