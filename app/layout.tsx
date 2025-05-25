import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { Analytics } from "@/components"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tomorrow Tracker",
  description: "Set and track your daily goals",
  generator: 'v0.dev'
}

// Force dynamic rendering for the entire app to avoid NextAuth SSR issues with React 19
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <CookieConsentBanner />
              <Analytics />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
