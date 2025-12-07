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
import Link from "next/link";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // TODO: Replace with actual brand data from context/props
  const currentBrand = {
    name: "BrandForge",
    plan: "Free",
  };

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Palette className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentBrand.name}</span>
                  <span className="truncate text-xs">{currentBrand.plan}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
