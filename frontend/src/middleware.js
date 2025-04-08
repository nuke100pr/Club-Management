// middleware.js
import { NextResponse } from "next/server";

// Define route categories
const PUBLIC_ROUTES = ["/about", "/contact", "/faq"]; // Routes accessible to everyone
const AUTH_ROUTES = ["/dashboard", "/profile", "/settings"]; // Routes requiring authentication
const AUTH_PAGES = ["/login", "/register"]; // Auth pages that should redirect to home if already logged in

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasAuthToken = request.cookies.has("auth_token");

  // Check if the current path is an authentication page (login/register)
  if (AUTH_PAGES.includes(pathname)) {
    // If user has auth token and tries to access login/register, redirect to home
    if (hasAuthToken) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    // Otherwise, allow access to login/register pages
    return NextResponse.next();
  }

  // Check if the path requires authentication
  const isProtectedRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's a protected route and user doesn't have an auth token
  if (isProtectedRoute && !hasAuthToken) {
    // Store the original URL to redirect back after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // All other cases, proceed normally
  return NextResponse.next();
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Match all routes except static files, api routes, etc.
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};