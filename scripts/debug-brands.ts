import { db } from "../src/lib/db";
import { brands, organizations, users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function debug() {
    console.log("🔍 Debugging Brands & Organizations...\n");

    const allUsers = await db.select().from(users);
    console.log(`found ${allUsers.length} users:`);
    for (const user of allUsers) {
        console.log(`- ${user.name} (ID: ${user.id})`);
    }

    const allOrgs = await db.select().from(organizations);
    console.log(`\nfound ${allOrgs.length} organizations:`);
    for (const org of allOrgs) {
        console.log(`- ${org.name} (ID: ${org.id}, Slug: ${org.slug})`);
    }

    const allBrands = await db.select().from(brands);
    console.log(`\nfound ${allBrands.length} brands:`);
    for (const brand of allBrands) {
        console.log(`- ${brand.name} (ID: ${brand.id}, UserID: ${brand.userId}, OrgID: ${brand.organizationId})`);
    }
}

debug()
    .catch(console.error)
    .finally(() => process.exit());
