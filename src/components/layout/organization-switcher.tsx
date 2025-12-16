"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import type { Organization } from "@/lib/db/schema";

interface OrganizationSwitcherProps {
    organizations: Organization[];
    activeOrganization: Organization | null;
    onOrganizationChange?: (org: Organization) => void;
}

export function OrganizationSwitcher({
    organizations,
    activeOrganization,
    onOrganizationChange,
}: OrganizationSwitcherProps) {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const [activeOrg, setActiveOrg] = React.useState<Organization | null>(
        activeOrganization || organizations[0] || null
    );

    const handleOrgChange = (org: Organization) => {
        setActiveOrg(org);
        // Save to cookie for persistence
        document.cookie = `organization_id=${org.id}; path=/; max-age=31536000`;
        onOrganizationChange?.(org);
        // Refresh to reload data for new org
        router.refresh();
    };

    if (!activeOrg) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Building className="size-4" />
                            </div>
                            <div className="grid flex-1 text-start text-sm leading-tight">
                                <span className="truncate font-semibold">{activeOrg.name}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {activeOrg.slug}
                                </span>
                            </div>
                            <ChevronsUpDown className="ms-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Organizations
                        </DropdownMenuLabel>
                        {organizations.map((org, index) => (
                            <DropdownMenuItem
                                key={org.id}
                                onClick={() => handleOrgChange(org)}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Building className="size-4 shrink-0" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium">{org.name}</div>
                                    <div className="text-xs text-muted-foreground">{org.slug}</div>
                                </div>
                                {org.id === activeOrg.id && (
                                    <span className="text-xs text-primary">Active</span>
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" disabled>
                            <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                                <Plus className="size-4" />
                            </div>
                            <div className="text-muted-foreground font-medium">
                                Add organization
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
