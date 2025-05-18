"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmailAndPassword } from "@/lib/firebase/auth"
import { signIn } from "next-auth/react"

export function TestLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testFirebaseAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log("Testing direct Firebase authentication")
      const firebaseResult = await signInWithEmailAndPassword(email, password)
      setResult({
        success: true,
        provider: "Firebase",
        uid: firebaseResult.user.uid,
        email: firebaseResult.user.email
      })
    } catch (err: any) {
      console.error("Firebase auth error:", err)
      setError(`Firebase Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testNextAuth = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log("Testing NextAuth authentication")
      const nextAuthResult = await signIn("credentials", {
        email,
        password,
        redirect: false
      })
      
      if (nextAuthResult?.error) {
        throw new Error(nextAuthResult.error)
      }
      
      setResult({
        success: true,
        provider: "NextAuth",
        result: nextAuthResult
      })
    } catch (err: any) {
      console.error("NextAuth error:", err)
      setError(`NextAuth Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Tester</CardTitle>
        <CardDescription>Test Firebase and NextAuth authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="test@example.com" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-green-50 p-3 rounded border border-green-200 text-green-600 text-sm">
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={testFirebaseAuth} 
          disabled={loading || !email || !password}
        >
          {loading ? "Testing..." : "Test Firebase Auth"}
        </Button>
        <Button 
          onClick={testNextAuth} 
          disabled={loading || !email || !password}
        >
          {loading ? "Testing..." : "Test NextAuth"}
        </Button>
      </CardFooter>
    </Card>
  )
}
