import { NextResponse } from "next/server"

export function middleware(request) {
  // Only log API requests
  if (request.nextUrl.pathname.startsWith("/api/")) {
    console.log(`[API] ${request.method} ${request.nextUrl.pathname}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
