"use client";

import * as React from "react";
import type { Role } from "@/lib/db/schema";
import { canPerform } from "./permissions";

/**
 * Auth context for client-side permission checks
 */
interface AuthContextValue {
    userId: string | null;
    organizationId: string | null;
    role: Role;
    isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: React.ReactNode;
    value: AuthContextValue;
}

export function AuthProvider({ children, value }: AuthProviderProps) {
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

/**
 * Hook to check if current user has a permission
 */
export function usePermission(permission: string): boolean {
    const { role } = useAuth();
    return canPerform(role, permission);
}

/**
 * Hook to check multiple permissions
 */
export function usePermissions(permissions: string[]): Record<string, boolean> {
    const { role } = useAuth();
    return permissions.reduce((acc, permission) => {
        acc[permission] = canPerform(role, permission);
        return acc;
    }, {} as Record<string, boolean>);
}

/**
 * Guard component that conditionally renders children based on permission
 */
interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionGuard({
    permission,
    children,
    fallback = null
}: PermissionGuardProps) {
    const hasPermission = usePermission(permission);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Guard component that requires one of multiple permissions
 */
interface AnyPermissionGuardProps {
    permissions: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AnyPermissionGuard({
    permissions,
    children,
    fallback = null
}: AnyPermissionGuardProps) {
    const permissionResults = usePermissions(permissions);
    const hasAnyPermission = Object.values(permissionResults).some(Boolean);

    if (!hasAnyPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Guard component that requires all permissions
 */
interface AllPermissionsGuardProps {
    permissions: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AllPermissionsGuard({
    permissions,
    children,
    fallback = null
}: AllPermissionsGuardProps) {
    const permissionResults = usePermissions(permissions);
    const hasAllPermissions = Object.values(permissionResults).every(Boolean);

    if (!hasAllPermissions) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Role guard - check if user has specific role
 */
interface RoleGuardProps {
    roles: Role[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function RoleGuard({
    roles,
    children,
    fallback = null
}: RoleGuardProps) {
    const { role } = useAuth();

    if (!roles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
