import { DashboardShell } from "@/components/layout/dashboard-shell"
import { db } from "@/lib/db"
import { organizations, teamMembers, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"

/**
 * Dashboard Layout
 * 
 * This layout wraps all routes under (dashboard) route group.
 * The sidebar and header persist across navigation - only the
 * content area (children) changes.
 * 
 * Fetches organizations and user data server-side to pass to client components.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get user ID from cookie
    const cookieStore = await cookies()
    let userId = cookieStore.get("user_id")?.value
    const activeOrgId = cookieStore.get("organization_id")?.value

    // Fallback: If no user cookie, get the first user from DB (Demo Mode)
    if (!userId) {
        const firstUser = await db.select().from(users).limit(1)
        if (firstUser[0]) {
            userId = firstUser[0].id
        }
    }

    // Fetch all organizations (for demo, we fetch all - in production, filter by user)
    const allOrganizations = await db.select().from(organizations)

    // Find active organization or default to first
    let activeOrganization = allOrganizations.find(org => org.id === activeOrgId) || allOrganizations[0] || null

    // Get user's role in active org (default to admin for demo)
    let userRole: "owner" | "admin" | "editor" | "viewer" | "ai_operator" = "admin"
    if (userId && activeOrganization) {
        const membership = await db.select()
            .from(teamMembers)
            .where(eq(teamMembers.userId, userId))
            .limit(1)

        if (membership[0]) {
            userRole = membership[0].role
        }
    }

    return (
        <DashboardShell
            organizations={allOrganizations}
            activeOrganization={activeOrganization}
            userId={userId}
            role={userRole}
        >
            {children}
        </DashboardShell>
    )
}
