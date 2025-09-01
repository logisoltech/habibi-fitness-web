import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map();

export function middleware(request) {
  // Apply rate limiting to auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${request.nextUrl.pathname}`;
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5; // 5 requests per minute
    
    const requestLog = rateLimitMap.get(key) || [];
    const validRequests = requestLog.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    validRequests.push(now);
    rateLimitMap.set(key, validRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, times] of rateLimitMap.entries()) {
        const validTimes = times.filter(time => now - time < windowMs);
        if (validTimes.length === 0) {
          rateLimitMap.delete(k);
        } else {
          rateLimitMap.set(k, validTimes);
        }
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
