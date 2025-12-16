"use client";

import * as React from "react";
import {
  Palette,
  Package,
  Images,
  FileText,
  Settings,
  Home,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { OrganizationSwitcher } from "./organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { Organization } from "@/lib/db/schema";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizations?: Organization[];
  activeOrganization?: Organization | null;
}

export function AppSidebar({
  organizations = [],
  activeOrganization = null,
  ...props
}: AppSidebarProps) {
  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Brands",
      url: "/brands",
      icon: Palette,
      items: [
        {
          title: "All Brands",
          url: "/brands",
        },
        {
          title: "Create New",
          url: "/brands/new",
        },
      ],
    },
    {
      title: "Assets",
      url: "/assets",
      icon: Images,
      items: [
        {
          title: "Generate",
          url: "/assets/generate",
        },
        {
          title: "Library",
          url: "/assets/library",
        },
      ],
    },
    {
      title: "Guidelines",
      url: "/guidelines",
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  // TODO: Replace with actual user brands
  const userBrands = [
    {
      name: "Example Brand",
      url: "/brands/example-id",
      icon: Package,
    },
  ];

  // TODO: Replace with actual user data
  const user = {
    name: "User",
    email: "user@brandforge.com",
    avatar: "",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={organizations}
          activeOrganization={activeOrganization}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={userBrands} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
