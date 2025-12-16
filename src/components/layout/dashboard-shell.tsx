"use client"

import * as React from "react"
import { AppSidebar } from "./app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { BreadcrumbProvider, useBreadcrumbs } from "./breadcrumb-context"
import { AuthProvider } from "@/lib/auth/guards"
import type { Organization, Role } from "@/lib/db/schema"

/**
 * Dashboard Shell - Header component that reads breadcrumbs from context
 */
function DashboardHeader() {
    const { breadcrumbs } = useBreadcrumbs()

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    {index > 0 && <BreadcrumbSeparator />}
                                    <BreadcrumbItem>
                                        {crumb.href ? (
                                            <BreadcrumbLink href={crumb.href}>
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}
            </div>
        </header>
    )
}

interface DashboardShellProps {
    children: React.ReactNode
    organizations?: Organization[]
    activeOrganization?: Organization | null
    userId?: string | null
    role?: Role
}

/**
 * Persistent Dashboard Shell
 * 
 * This component provides the sidebar and header that persists across
 * all dashboard routes. The sidebar never re-renders during navigation.
 * 
 * Pages can set breadcrumbs using the useSetBreadcrumbs hook.
 */
export function DashboardShell({
    children,
    organizations = [],
    activeOrganization = null,
    userId = null,
    role = "admin",
}: DashboardShellProps) {
    return (
        <AuthProvider value={{
            userId,
            organizationId: activeOrganization?.id || null,
            role,
            isAuthenticated: !!userId,
        }}>
            <BreadcrumbProvider>
                <SidebarProvider>
                    <AppSidebar
                        organizations={organizations}
                        activeOrganization={activeOrganization}
                    />
                    <SidebarInset>
                        <DashboardHeader />
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            {children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </BreadcrumbProvider>
        </AuthProvider>
    )
}
