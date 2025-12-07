
import { type LucideIcon, LayoutDashboard, Palette, Settings, Users } from "lucide-react";

export type ModuleConfig = {
    id: string;
    name: string;
    description: string;
    path: string;
    icon: LucideIcon;
    permission: string; // The required permission to view this module
};

export const modules: ModuleConfig[] = [
    {
        id: "dashboard",
        name: "Dashboard",
        description: "Overview of your workspace",
        path: "/dashboard",
        icon: LayoutDashboard,
        permission: "view:dashboard",
    },
    {
        id: "brands",
        name: "Brands",
        description: "Manage your brands and assets",
        path: "/brands",
        icon: Palette,
        permission: "view:brands",
    },
    {
        id: "users",
        name: "Users",
        description: "Manage system users",
        path: "/users",
        icon: Users,
        permission: "view:users",
    },
    {
        id: "settings",
        name: "Settings",
        description: "System settings and preferences",
        path: "/settings",
        icon: Settings,
        permission: "view:settings",
    },
];
