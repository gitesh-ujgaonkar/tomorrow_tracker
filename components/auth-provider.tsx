"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Make sure we're only using SessionProvider on the client side
  return <SessionProvider>{children}</SessionProvider>
}
