"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/config"

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string>("") 
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if environment variables are available
    const vars: Record<string, string> = {}
    if (typeof window !== "undefined") {
      // Only check public variables that are safe to expose
      const envVarNames = [
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
      ]
      
      envVarNames.forEach(name => {
        vars[name] = process.env[name] ? "u2713 Set" : "u2717 Not set"
      })
      
      setEnvVars(vars)
    }

    // Simple test to check if Firebase is initialized
    const testFirebase = async () => {
      try {
        setStatus("loading")
        
        // Check if db is initialized
        if (!db) {
          throw new Error("Firebase db is not initialized")
        }
        
        console.log("Firebase db object exists:", !!db)
        setStatus("success")
      } catch (error: any) {
        console.error("Firebase test error:", error)
        setErrorDetails(error.message || "Unknown error")
        setStatus("error")
      }
    }

    testFirebase()
  }, [])

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Firebase Connection Test</h1>
      
      <div className="mb-8 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Environment Variables Check</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key}>{key}: {value}</div>
          ))}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Firebase Connection Status</h2>
        {status === "loading" && (
          <div className="text-blue-600">Testing Firebase connection...</div>
        )}
        {status === "success" && (
          <div className="text-green-600">u2713 Firebase is properly initialized!</div>
        )}
        {status === "error" && (
          <div>
            <div className="text-red-600">u2717 Firebase initialization error</div>
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
              {errorDetails}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        <p>This page tests only the Firebase initialization, not authentication or database queries.</p>
        <p>Check browser console for additional debug information.</p>
      </div>
    </div>
  )
}
