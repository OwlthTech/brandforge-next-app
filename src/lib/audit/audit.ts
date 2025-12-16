import "server-only";
import { db } from "@/lib/db";
import { auditLogs, type InsertAuditLog } from "@/lib/db/schema";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/dal/auth";

/**
 * Log an action to the audit log
 */
export async function logAudit(params: {
    action: string;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const user = await getCurrentUser();
        const headersList = await headers();

        const auditEntry: InsertAuditLog = {
            userId: user?.id || null,
            organizationId: user?.organizationId || null,
            action: params.action,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            metadata: params.metadata,
            ipAddress: headersList.get("x-forwarded-for") || headersList.get("x-real-ip"),
            userAgent: headersList.get("user-agent"),
        };

        await db.insert(auditLogs).values(auditEntry);
    } catch (error) {
        // Log error but don't throw - audit logging should never break the app
        console.error("[Audit Log Error]", error);
    }
}

/**
 * Audit log action constants
 */
export const AUDIT_ACTIONS = {
    // Brand actions
    BRAND_CREATE: "brand.create",
    BRAND_UPDATE: "brand.update",
    BRAND_DELETE: "brand.delete",

    // Product actions
    PRODUCT_CREATE: "product.create",
    PRODUCT_UPDATE: "product.update",
    PRODUCT_DELETE: "product.delete",

    // Guideline actions
    GUIDELINE_CREATE: "guideline.create",
    GUIDELINE_UPDATE: "guideline.update",
    GUIDELINE_DELETE: "guideline.delete",
    GUIDELINE_FINALIZE: "guideline.finalize",
    GUIDELINE_REVERT: "guideline.revert",

    // Asset actions
    ASSET_UPLOAD: "asset.upload",
    ASSET_DELETE: "asset.delete",
    ASSET_APPROVE: "asset.approve",

    // AI actions
    AI_GENERATE_GUIDELINE: "ai.generate_guideline",
    AI_REGENERATE_FIELD: "ai.regenerate_field",

    // Team actions
    TEAM_INVITE: "team.invite",
    TEAM_REMOVE: "team.remove",
    TEAM_ROLE_CHANGE: "team.role_change",

    // Auth actions
    AUTH_LOGIN: "auth.login",
    AUTH_LOGOUT: "auth.logout",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
