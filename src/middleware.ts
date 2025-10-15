import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    request.nextUrl.pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for authentication token in cookies with multiple possible names
    const token = request.cookies.get('token')?.value || 
                  request.cookies.get('access_token')?.value ||
                  request.cookies.get('id_token')?.value;
    
    // Debug logging (remove in production)
    console.log('Middleware check:', {
      path: request.nextUrl.pathname,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 10) + '...']))
    });
    
    // If no token, redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Basic token validation
    try {
      // Check if token looks like a JWT (has 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Try to decode the payload (without verification for basic check)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.log('Token expired, redirecting to login');
        throw new Error('Token expired');
      }
      
      console.log('Token valid, allowing access to:', request.nextUrl.pathname);
      
      // Allow the request to continue
      return NextResponse.next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Token validation failed:', errorMessage);
      
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
  // Match all admin routes but exclude API routes and static files
  matcher: [
    '/admin/:path*',
  ],
};