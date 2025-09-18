import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('token')?.value;
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // For admin routes, check if user has admin role
    // You can decode the token here or make an API call to verify admin permissions
    // For now, we'll do a simple check (you should implement proper JWT verification)
    try {
      // Simple token validation - in production, use proper JWT verification
      if (token.length < 10) {
        throw new Error('Invalid token');
      }
      
      // You can add more sophisticated role checking here
      // For example, decode JWT and check user role
      
      // Allow the request to continue
      return NextResponse.next();
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // For non-admin routes, allow the request to continue
  return NextResponse.next();
}

export const config = {
  // Match all admin routes
  matcher: [
    '/admin/:path*',
  ],
};