import { userRepository, brandRepository, productRepository } from "../repositories";

/**
 * Simple test script to verify database and repositories
 * Run with: node --loader ts-node/esm lib/db/seed.ts
 * Or add to package.json scripts
 */
async function testDatabase() {
  console.log("🧪 Testing BrandForge Database...\n");

  try {
    // Test 1: Create a user
    console.log("Creating test user...");
    const user = await userRepository.create({
      name: "Test User",
      email: "test@brandforge.com",
    });
    console.log("✓ User created:", user.id);

    // Test 2: Create a brand
    console.log("\nCreating test brand...");
    const brand = await brandRepository.create({
      userId: user.id,
      name: "Test Brand",
      description: "A test brand for development",
      industry: "Technology",
      primaryColor: "#0066cc",
      secondaryColor: "#ff6600",
    });
    console.log("✓ Brand created:", brand.id);

    // Test 3: Create a product
    console.log("\nCreating test product...");
    const product = await productRepository.create({
      brandId: brand.id,
      name: "Test Product",
      description: "A test product",
      category: "Software",
      tags: ["test", "demo"],
      features: ["Feature 1", "Feature 2"],
    });
    console.log("✓ Product created:", product.id);

    // Test 4: Query back
    console.log("\n📊 Querying data...");
    const brands = await brandRepository.listForUser(user.id);
    const products = await productRepository.listForBrand(brand.id);

    console.log(`✓ Found ${brands.length} brand(s) for user`);
    console.log(`✓ Found ${products.length} product(s) for brand`);

    console.log("\n✅ Database test completed successfully!");
    console.log("\nDatabase file location: ./data/brandforge.db");
  } catch (error) {
    console.error("\n❌ Database test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testDatabase();
}

export { testDatabase };
