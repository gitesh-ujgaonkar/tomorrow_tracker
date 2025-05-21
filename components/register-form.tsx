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
  const [registrationStatus, setRegistrationStatus] = useState<"idle" | "creating" | "signing-in" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    setRegistrationStatus("creating")
    setErrorMessage(null)

    try {
      // Show a persistent toast that we'll update with progress
      toast({
        title: "Creating account",
        description: "Step 1/3: Setting up your account...",
        duration: 10000, // Longer duration since we'll update it
      })

      console.log("Starting user registration for:", values.email)
      console.log("Registration details:", {
        email: values.email,
        name: values.name,
        passwordLength: values.password.length
      })

      // Create user in Firebase
      let user = null
      try {
        user = await createUserWithEmailAndPassword(values.email, values.password, values.name)
        console.log("User created successfully in Firebase:", {
          uid: user?.uid,
          email: user?.email,
          displayName: user?.displayName
        })
        
        // Update toast with progress
        toast({
          title: "Account created",
          description: "Step 2/3: Finalizing your account...",
          duration: 5000,
        })
      } catch (regError: any) {
        console.error("Error during user creation:", regError)
        setRegistrationStatus("error")
        let errorMsg = regError.message || "Failed to create account"
        if (errorMsg.includes("email-already-in-use")) {
          errorMsg = "This email is already registered. Please use a different email or try signing in."
        }
        setErrorMessage(errorMsg)
        throw regError; // Re-throw to be caught by the outer try/catch
      }

      // Short delay to ensure Firebase has completed the registration process
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update toast with sign-in progress
      toast({
        title: "Signing in",
        description: "Step 3/3: Signing you in...",
        duration: 5000,
      })
      setRegistrationStatus("signing-in")

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
        setRegistrationStatus("error")
        setErrorMessage("Account created but couldn't sign you in automatically. Please try logging in manually.")
        toast({
          title: "Sign-in Error",
          description: "Account created but couldn't sign you in automatically. Please try logging in manually.",
          variant: "destructive",
          duration: 5000,
        })
        // Redirect to login page after a short delay if sign-in fails after registration
        setTimeout(() => {
          window.location.href = "/login"
        }, 3000)
        return
      }

      // Success - update status and toast
      setRegistrationStatus("success")
      toast({
        title: "Success!",
        description: "Your account has been created and you're now signed in!",
        duration: 3000,
      })
      
      // Use window.location for a full page refresh to ensure session is loaded, but with a short delay
      console.log("Redirecting to dashboard with full page refresh")
      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error: any) {
      console.error("Registration error:", error)
      setRegistrationStatus("error")
      let errorMsg = error.message || "Failed to create account. Please try again."
      
      // Provide more user-friendly error messages for common issues
      if (errorMsg.includes("email-already-in-use")) {
        errorMsg = "This email is already registered. Please use a different email or try signing in."
      } else if (errorMsg.includes("network-request-failed")) {
        errorMsg = "Network error. Please check your internet connection and try again."
      }
      
      setErrorMessage(errorMsg)
      toast({
        title: "Registration Error",
        description: errorMsg,
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
      {/* Registration Status Banner */}
      {registrationStatus !== "idle" && (
        <div className={`p-3 rounded-md text-sm font-medium ${
          registrationStatus === "error" ? "bg-red-50 text-red-600 border border-red-200" : 
          registrationStatus === "success" ? "bg-green-50 text-green-600 border border-green-200" : 
          "bg-blue-50 text-blue-600 border border-blue-200"
        }`}>
          {registrationStatus === "creating" && (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating your account...
            </div>
          )}
          {registrationStatus === "signing-in" && (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing you in...
            </div>
          )}
          {registrationStatus === "success" && (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Success! Redirecting to dashboard...
            </div>
          )}
          {registrationStatus === "error" && errorMessage && (
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {errorMessage}
            </div>
          )}
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isLoading || registrationStatus === "success"} />
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
                  <Input placeholder="name@example.com" {...field} disabled={isLoading || registrationStatus === "success"} />
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
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading || registrationStatus === "success"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || registrationStatus === "success"}>
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {registrationStatus === "creating" ? "Creating Account..." : "Signing In..."}
              </span>
            ) : "Create Account"}
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
