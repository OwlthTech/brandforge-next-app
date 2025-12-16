import type { Role } from "@/lib/db/schema";

/**
 * Permission definitions for RBAC
 * Maps resource actions to allowed roles
 */
export const PERMISSIONS = {
    // Brand permissions
    brand: {
        create: ["owner", "admin"] as const,
        read: ["owner", "admin", "editor", "viewer", "ai_operator"] as const,
        update: ["owner", "admin", "editor"] as const,
        delete: ["owner", "admin"] as const,
    },

    // Product permissions
    product: {
        create: ["owner", "admin", "editor"] as const,
        read: ["owner", "admin", "editor", "viewer", "ai_operator"] as const,
        update: ["owner", "admin", "editor"] as const,
        delete: ["owner", "admin", "editor"] as const,
    },

    // Guideline permissions
    guideline: {
        create: ["owner", "admin", "editor"] as const,
        read: ["owner", "admin", "editor", "viewer", "ai_operator"] as const,
        update: ["owner", "admin", "editor"] as const,
        delete: ["owner", "admin"] as const,
        finalize: ["owner", "admin"] as const,
    },

    // Asset permissions
    asset: {
        create: ["owner", "admin", "editor", "ai_operator"] as const,
        read: ["owner", "admin", "editor", "viewer", "ai_operator"] as const,
        update: ["owner", "admin", "editor"] as const,
        delete: ["owner", "admin", "editor"] as const,
        approve: ["owner", "admin"] as const,
    },

    // AI feature permissions
    ai: {
        generate: ["owner", "admin", "editor", "ai_operator"] as const,
        chat: ["owner", "admin", "editor", "ai_operator"] as const,
    },

    // Team/Organization permissions
    team: {
        manage: ["owner", "admin"] as const,
        invite: ["owner", "admin"] as const,
        view: ["owner", "admin", "editor", "viewer", "ai_operator"] as const,
    },

    // Settings permissions
    settings: {
        view: ["owner", "admin"] as const,
        update: ["owner", "admin"] as const,
    },
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Action<R extends Resource> = keyof typeof PERMISSIONS[R];

/**
 * Check if a role has permission to perform an action on a resource
 */
export function can<R extends Resource>(
    role: Role,
    resource: R,
    action: Action<R>
): boolean {
    const allowedRoles = PERMISSIONS[resource][action] as readonly Role[];
    return allowedRoles.includes(role);
}

/**
 * Check if a role has permission (string-based, for dynamic checks)
 */
export function canPerform(
    role: Role,
    permission: string // e.g., "brand:create", "ai:generate"
): boolean {
    const [resource, action] = permission.split(":") as [Resource, string];
    if (!PERMISSIONS[resource]) return false;
    const resourcePerms = PERMISSIONS[resource] as Record<string, readonly Role[]>;
    const allowedRoles = resourcePerms[action];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): string[] {
    const permissions: string[] = [];

    for (const [resource, actions] of Object.entries(PERMISSIONS)) {
        for (const [action, roles] of Object.entries(actions)) {
            if ((roles as readonly string[]).includes(role)) {
                permissions.push(`${resource}:${action}`);
            }
        }
    }

    return permissions;
}

/**
 * Role hierarchy (higher index = more permissions)
 */
export const ROLE_HIERARCHY: Role[] = [
    "viewer",
    "ai_operator",
    "editor",
    "admin",
    "owner",
];

/**
 * Check if roleA has equal or higher privileges than roleB
 */
export function hasEqualOrHigherRole(roleA: Role, roleB: Role): boolean {
    return ROLE_HIERARCHY.indexOf(roleA) >= ROLE_HIERARCHY.indexOf(roleB);
}
