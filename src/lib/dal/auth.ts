import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import type { Role } from "@/lib/db/schema"

/**
 * Data Access Layer - Authentication
 * 
 * This module provides centralized authentication and session management.
 * Currently uses a placeholder implementation that will be replaced with
 * proper auth (NextAuth.js) in Phase 2.
 */

export interface User {
    id: string
    name: string
    email: string | null
    role: Role
    organizationId: string | null
}

/**
 * Get the current authenticated user.
 * Uses React's cache() to dedupe calls within a single request.
 * 
 * @returns User object if authenticated, null otherwise
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value
    const orgId = cookieStore.get("organization_id")?.value

    // TODO: Phase 2 - Replace with real session verification
    // For now, check if user_id cookie exists (set during onboarding)
    if (!userId) {
        return null
    }

    // In Phase 2, verify session against database
    // const session = await db.select().from(sessions).where(eq(sessions.id, sessionId))

    return {
        id: userId,
        name: "Demo User",
        email: null,
        role: "admin", // Default to admin for demo
        organizationId: orgId || null,
    }
})

/**
 * Verify if current request has a valid session.
 * 
 * @returns true if authenticated, false otherwise
 */
export const verifySession = async (): Promise<boolean> => {
    const user = await getCurrentUser()
    return user !== null
}

/**
 * Get current user or throw if not authenticated.
 * Use this in Server Actions that require authentication.
 * 
 * @throws Error if not authenticated
 */
export const requireAuth = async (): Promise<User> => {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error("Authentication required")
    }
    return user
}

/**
 * Check if current user has required role.
 * 
 * @param requiredRoles - Array of roles that are allowed
 * @returns true if user has one of the required roles
 */
export const hasRole = async (requiredRoles: User["role"][]): Promise<boolean> => {
    const user = await getCurrentUser()
    if (!user) return false
    return requiredRoles.includes(user.role)
}
