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
import { signInWithEmailAndPassword } from "@/lib/firebase/auth"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Show loading toast
      toast({
        title: "Signing in",
        description: "Verifying your credentials...",
      })

      console.log("Attempting to sign in with email:", values.email)

      // SIMPLIFIED APPROACH: Skip Firebase direct authentication and use NextAuth directly
      // This avoids potential issues with double authentication
      console.log("Using simplified authentication approach")
      
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      console.log("NextAuth sign-in result:", result)

      if (result?.error) {
        console.error("Authentication error:", result.error)
        
        // Extract error message
        let errorMessage = "Invalid email or password";
        let errorTitle = "Login Failed";
        
        if (result.error.includes("user-not-found")) {
          errorMessage = "No account found with this email. Please check your email or register.";
        } else if (result.error.includes("wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (result.error.includes("too-many-requests")) {
          errorMessage = "Too many unsuccessful login attempts. Please try again later.";
        } else if (result.error.includes("network-request-failed")) {
          errorMessage = "Network error. Please check your internet connection.";
        } else if (result.error.includes("database")) {
          errorTitle = "Database Error";
          errorMessage = "There was an issue connecting to the database. Please try again later.";
        } else {
          // For any other errors, show the actual error message for debugging
          errorMessage = `Authentication error: ${result.error}`;
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Success toast
      toast({
        title: "Success",
        description: "You've been signed in successfully!",
      })
      
      // IMPORTANT: Use window.location for a full page refresh to ensure session is loaded
      console.log("Redirecting to dashboard with full page refresh")
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login exception:", error)
      toast({
        title: "Login Error",
        description: error.message || "Something went wrong. Please try again.",
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
            {isLoading ? "Signing in..." : "Sign In"}
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
        Don't have an account?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  )
}
