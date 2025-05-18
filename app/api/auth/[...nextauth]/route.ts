import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

console.log('NextAuth API route initialized')

// Log auth options for debugging (excluding sensitive data)
console.log('Auth options:', {
  providers: authOptions.providers.map(p => p.id),
  session: authOptions.session,
  pages: authOptions.pages,
  debug: authOptions.debug,
  secretSet: !!authOptions.secret
})

// Create the handler outside of any try/catch to avoid export issues
const handler = NextAuth(authOptions)
console.log('NextAuth handler created successfully')

export { handler as GET, handler as POST }
