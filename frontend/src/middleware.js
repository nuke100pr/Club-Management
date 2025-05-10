// middleware.js
import { NextResponse } from "next/server";

// Define route categories
const AUTH_PAGES = ["/login", "/register"]; // Only pages accessible without auth

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasAuthToken = request.cookies.has("auth_token");

  // If user is not authenticated
  if (!hasAuthToken) {
    // Only allow access to login and register pages
    if (AUTH_PAGES.includes(pathname)) {
      return NextResponse.next();
    } 
    
    // For all other routes, redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  
  // User is authenticated

  // If user has auth token and tries to access login/register, redirect to home
  if (AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // For all other routes, allow access since user is authenticated
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Match all routes except static files, api routes, etc.
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};