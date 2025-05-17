"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mic, Plus, Trash } from "lucide-react"
import { addGoal } from "@/lib/firebase/firestore"

const goalItemSchema = z.object({
  text: z.string().min(1, { message: "Goal text is required" }),
  hasTime: z.boolean().default(false),
  time: z.string().optional(),
})

const formSchema = z.object({
  goals: z.array(goalItemSchema).min(1, { message: "Add at least one goal" }),
})

export function GoalForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: [{ text: "", hasTime: false, time: "" }],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to set goals",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")

      // Add each goal to Firestore
      for (const goal of values.goals) {
        await addGoal({
          userId: session.user.id,
          text: goal.text,
          date: tomorrow,
          hasTime: goal.hasTime,
          time: goal.hasTime ? goal.time : null,
          completed: false,
          createdAt: new Date().toISOString(),
        })
      }

      toast({
        title: "Success",
        description: "Your goals for tomorrow have been set!",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startSpeechRecognition = (index: number) => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    setCurrentGoalIndex(index)

    // Initialize speech recognition
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
      const goals = form.getValues().goals
      goals[index].text = transcript
      form.setValue("goals", goals)
    }

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
      setCurrentGoalIndex(null)
    }

    recognitionInstance.onend = () => {
      setIsListening(false)
      setCurrentGoalIndex(null)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          {form.getValues().goals.map((_, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Goal {index + 1}</h3>
                {form.getValues().goals.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const currentGoals = form.getValues().goals
                      form.setValue(
                        "goals",
                        currentGoals.filter((_, i) => i !== index),
                      )
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name={`goals.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you want to accomplish?</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Textarea placeholder="Enter your goal here..." className="resize-none" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={isListening && currentGoalIndex === index ? "bg-red-100" : ""}
                        onClick={() => {
                          if (isListening && currentGoalIndex === index) {
                            stopSpeechRecognition()
                          } else {
                            startSpeechRecognition(index)
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
                name={`goals.${index}.hasTime`}
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

              {form.watch(`goals.${index}.hasTime`) && (
                <FormField
                  control={form.control}
                  name={`goals.${index}.time`}
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
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const currentGoals = form.getValues().goals
            form.setValue("goals", [...currentGoals, { text: "", hasTime: false, time: "" }])
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Goal
        </Button>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : "Save Tomorrow's Goals"}
        </Button>
      </form>
    </Form>
  )
}
