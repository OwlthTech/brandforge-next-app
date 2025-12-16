/**
 * Seed script to create default organizations and link existing brands
 * 
 * Run with: npx tsx scripts/seed-organizations.ts
 */

import { db } from "../src/lib/db";
import { organizations, brands, users, teamMembers } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🌱 Seeding organizations...\n");

    // 1. Create default organization
    const defaultOrg = await db.insert(organizations).values({
        name: "Default Organization",
        slug: "default",
    }).returning();
    console.log("✅ Created default organization:", defaultOrg[0].name);

    // 2. Create second organization (no brands)
    const secondOrg = await db.insert(organizations).values({
        name: "Demo Workspace",
        slug: "demo-workspace",
    }).returning();
    console.log("✅ Created second organization:", secondOrg[0].name);

    // 3. Get all existing brands
    const existingBrands = await db.select().from(brands);
    console.log(`\n📦 Found ${existingBrands.length} existing brands`);

    // 4. Link all brands to default organization
    for (const brand of existingBrands) {
        await db.update(brands)
            .set({ organizationId: defaultOrg[0].id })
            .where(eq(brands.id, brand.id));
        console.log(`  → Linked brand "${brand.name}" to default organization`);
    }

    // 5. Get existing users and add them as owners to default org
    const existingUsers = await db.select().from(users);
    console.log(`\n👥 Found ${existingUsers.length} existing users`);

    for (const user of existingUsers) {
        // Add user to default org as owner
        await db.insert(teamMembers).values({
            userId: user.id,
            organizationId: defaultOrg[0].id,
            role: "owner",
        });
        console.log(`  → Added user "${user.name}" as owner of default organization`);

        // Add user to second org as viewer (demo)
        await db.insert(teamMembers).values({
            userId: user.id,
            organizationId: secondOrg[0].id,
            role: "viewer",
        });
        console.log(`  → Added user "${user.name}" as viewer of demo workspace`);
    }

    console.log("\n✅ Seeding complete!");
    console.log("\nOrganizations:");
    console.log(`  1. ${defaultOrg[0].name} (${defaultOrg[0].slug}) - ${existingBrands.length} brands`);
    console.log(`  2. ${secondOrg[0].name} (${secondOrg[0].slug}) - 0 brands`);
}

seed()
    .catch(console.error)
    .finally(() => process.exit());
