"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ChromeIcon as Google } from "lucide-react"
import { createUserWithEmailAndPassword } from "@/lib/firebase/auth"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Show a loading toast
      toast({
        title: "Creating account",
        description: "Please wait while we set up your account...",
      })

      console.log("Starting user registration for:", values.email)

      // Create user in Firebase
      const user = await createUserWithEmailAndPassword(values.email, values.password, values.name)
      
      console.log("User created successfully in Firebase:", user ? "Yes" : "No")

      // Show success toast
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      })

      // Short delay to ensure Firebase has completed the registration process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Sign in the user using a direct approach
      console.log("Using direct sign-in approach after registration")
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/dashboard"
      })

      console.log("NextAuth sign-in result:", result)

      if (result?.error) {
        console.error("NextAuth sign-in error:", result.error)
        toast({
          title: "Sign-in Error",
          description: "Account created but couldn't sign you in automatically. Please try logging in manually.",
          variant: "destructive",
        })
        // Redirect to login page if sign-in fails after registration
        window.location.href = "/login"
        return
      }

      // Success - redirect to dashboard
      toast({
        title: "Success",
        description: "You're now signed in!",
      })
      
      // Use window.location for a full page refresh to ensure session is loaded
      console.log("Redirecting to dashboard with full page refresh")
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Registration error:", error)
      let errorMessage = error.message || "Failed to create account. Please try again."
      
      // Provide more user-friendly error messages for common issues
      if (errorMessage.includes("email-already-in-use")) {
        errorMessage = "This email is already registered. Please use a different email or try signing in."
      } else if (errorMessage.includes("network-request-failed")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn} className="w-full">
        <Google className="mr-2 h-4 w-4" />
        Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
