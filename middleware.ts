import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
 
// This middleware ensures proper authentication and routing
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/set-goals') ||
                          request.nextUrl.pathname.startsWith('/edit-goal')

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Continue the request for all other cases
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  // Only run the middleware for these paths
  matcher: [
    '/api/auth/:path*', 
    '/dashboard/:path*', 
    '/login', 
    '/register', 
    '/settings/:path*',
    '/set-goals',
    '/edit-goal/:path*'
  ],
}
