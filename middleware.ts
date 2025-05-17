import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This middleware ensures that authentication-related pages are not statically generated
export function middleware(request: NextRequest) {
  // Continue the request
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  // Only run the middleware for authentication-related paths
  matcher: ['/api/auth/:path*', '/dashboard/:path*', '/login', '/register', '/settings/:path*'],
}
