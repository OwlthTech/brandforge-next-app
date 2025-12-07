
export type Role = "admin" | "manager" | "viewer";

export type Permission =
    | "view:dashboard"
    | "view:brands"
    | "create:brands"
    | "edit:brands"
    | "delete:brands"
    | "view:users"
    | "manage:users"
    | "view:settings"
    | "manage:settings";

export const ROLES: Record<Role, { label: string; permissions: Permission[] }> = {
    admin: {
        label: "Admin",
        permissions: [
            "view:dashboard",
            "view:brands",
            "create:brands",
            "edit:brands",
            "delete:brands",
            "view:users",
            "manage:users",
            "view:settings",
            "manage:settings",
        ],
    },
    manager: {
        label: "Manager",
        permissions: [
            "view:dashboard",
            "view:brands",
            "create:brands",
            "edit:brands",
            "view:settings",
        ],
    },
    viewer: {
        label: "Viewer",
        permissions: [
            "view:dashboard",
            "view:brands",
        ],
    },
};

export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLES[role]?.permissions.includes(permission) ?? false;
}
