import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// This middleware ensures proper authentication and routing
export async function middleware(request: NextRequest) {
  try {
    // Get the token from the request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'your-secret-key', // Fallback for development
      secureCookie: process.env.NODE_ENV === 'production'
    })

    const { pathname } = request.nextUrl
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
    const isApiAuthRoute = pathname.startsWith('/api/auth')
    const isPublicRoute = ['/'].includes(pathname)

    // Allow API auth routes to proceed without redirection
    if (isApiAuthRoute) {
      return NextResponse.next()
    }

    // For public routes, just continue
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // If there's a token, user is authenticated
    if (token) {
      // Redirect authenticated users away from auth pages to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      // For all other authenticated routes, continue
      return NextResponse.next()
    }

    // If no token and trying to access protected routes
    if (!token && !isAuthRoute) {
      // Store the current URL for redirecting back after login
      const loginUrl = new URL('/login', request.url)
      // Only set callbackUrl if it's not already set to avoid redirect loops
      if (pathname && pathname !== '/login' && pathname !== '/register') {
        loginUrl.searchParams.set('callbackUrl', pathname)
      } else {
        loginUrl.searchParams.set('callbackUrl', '/dashboard')
      }
      return NextResponse.redirect(loginUrl)
    }

    // Allow the request to continue for auth pages when not authenticated
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  // Match all paths except for static files and _next paths
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
