
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simulating a logged-in user for the demo
// In a real app, this would come from a session/token
const DEMO_USER_ROLE = "admin"; // Default to admin for now

export function middleware(request: NextRequest) {
    // 1. Log request (optional)
    // console.log(`[Middleware] ${request.method} ${request.url}`);

    // 2. Check auth (simplified)
    // For this demo, we assume the user is logged in
    // In real app: verify session token

    // 3. RBAC Check
    // We'll implement strict RBAC in the page guards/layout
    // Middleware can handle high-level route protection

    // Example: Protect /settings from non-admins
    if (request.nextUrl.pathname.startsWith("/settings")) {
        if (DEMO_USER_ROLE !== "admin" && DEMO_USER_ROLE !== "manager") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
