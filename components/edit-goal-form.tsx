"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Mic } from "lucide-react"
import { getGoalById, updateGoal } from "@/lib/firebase/firestore"

const formSchema = z.object({
  text: z.string().min(1, { message: "Goal text is required" }),
  hasTime: z.boolean().default(false),
  time: z.string().optional(),
})

export function EditGoalForm({ goalId }: { goalId: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoal, setIsLoadingGoal] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      hasTime: false,
      time: "",
    },
  })

  useEffect(() => {
    async function fetchGoal() {
      if (!session?.user?.id) return

      try {
        const goal = await getGoalById(goalId)

        if (!goal || goal.userId !== session.user.id) {
          toast({
            title: "Error",
            description: "Goal not found or you don't have permission to edit it",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        form.reset({
          text: goal.text,
          hasTime: goal.hasTime,
          time: goal.time || "",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load goal details",
          variant: "destructive",
        })
      } finally {
        setIsLoadingGoal(false)
      }
    }

    fetchGoal()
  }, [session, goalId, form, router, toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update goals",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const goal = await getGoalById(goalId)

      if (!goal || goal.userId !== session.user.id) {
        toast({
          title: "Error",
          description: "Goal not found or you don't have permission to edit it",
          variant: "destructive",
        })
        return
      }

      await updateGoal({
        ...goal,
        text: values.text,
        hasTime: values.hasTime,
        time: values.hasTime ? values.time || null : null,
      })

      toast({
        title: "Success",
        description: "Your goal has been updated!",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.lang = "en-US"

    recognitionInstance.onstart = () => {
      setIsListening(true)
    }

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      form.setValue("text", transcript)
    }

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
    }

    recognitionInstance.start()
    setRecognition(recognitionInstance)
  }

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop()
      setRecognition(null)
    }
  }

  if (isLoadingGoal) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea placeholder="Enter your goal here..." className="resize-none" {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={isListening ? "bg-red-100" : ""}
                  onClick={() => {
                    if (isListening) {
                      stopSpeechRecognition()
                    } else {
                      startSpeechRecognition()
                    }
                  }}
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasTime"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Set specific time</FormLabel>
                <FormDescription>You'll receive notifications before this time</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("hasTime") && (
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
