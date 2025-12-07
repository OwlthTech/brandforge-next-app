import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, productRepository, assetRepository, guidelineRepository } from "@/lib/repositories";
import type { ProductGuidelineSections } from "@/types/guideline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, productId, guidelineId, overrides } = body;

    if (!brandId || !productId) {
      return NextResponse.json(
        { error: "brandId and productId are required" },
        { status: 400 }
      );
    }

    // Fetch brand data
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Fetch product data
    const product = await productRepository.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch product assets
    const productAssets = await assetRepository.listForProduct(productId);
    const productImages = productAssets.filter(a => a.type === "product-image");
    const referenceAssets = productAssets.filter(a => a.type === "design-reference");

    // Build context for AI
    const context = {
      brandName: brand.name,
      brandIndustry: brand.industry,
      brandDescription: brand.description,
      productName: product.name,
      productDescription: product.description,
      productCategory: product.category,
      productTags: Array.isArray(product.tags) ? product.tags : [],
      productImageCount: productImages.length,
      referenceAssetCount: referenceAssets.length,
      ...overrides,
    };

    // Get AI model
    const model = initAIClient();

    // Generate product guidelines
    const prompt = `You are a professional product marketing strategist. Generate comprehensive product guidelines for the following product:

Brand: ${context.brandName} (${context.brandIndustry})
Product Name: ${context.productName}
Category: ${context.productCategory || "Not specified"}
Description: ${context.productDescription || "Not provided"}
Tags: ${context.productTags.join(", ") || "None"}

Product has ${context.productImageCount} product images and ${context.referenceAssetCount} design references uploaded.

Generate detailed product guidelines in JSON format with the following structure:
{
  "positioning": {
    "productDescription": "Detailed product description",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "uniqueSellingPoints": ["usp1", "usp2", "usp3"],
    "targetMarket": "Target market description",
    "competitiveDifferentiation": "What makes this product unique"
  },
  "messaging": {
    "headline": "Compelling product headline",
    "tagline": "Memorable tagline",
    "keyMessages": ["message1", "message2", "message3"],
    "callToAction": "Primary CTA",
    "toneGuidance": "Tone and voice for this product"
  },
  "visuals": {
    "photographyGuidelines": "How to photograph this product",
    "requiredAngles": ["front", "back", "side", "detail"],
    "lightingStyle": "Lighting recommendations",
    "backgroundPreferences": "Background recommendations",
    "compositionNotes": "Composition guidelines"
  },
  "marketplace": {
    "titleFormula": "Product title formula for marketplaces",
    "bulletPointGuidelines": ["guideline1", "guideline2"],
    "descriptionStructure": "Structure for marketplace descriptions",
    "searchKeywords": ["keyword1", "keyword2", "keyword3"],
    "categorySpecificNotes": "Platform-specific notes"
  },
  "socialMedia": {
    "instagramGuidelines": "Instagram content strategy",
    "facebookGuidelines": "Facebook content strategy",
    "pinterestGuidelines": "Pinterest content strategy",
    "contentThemes": ["theme1", "theme2", "theme3"]
  },
  "assetRequirements": {
    "requiredAssetTypes": ["type1", "type2"],
    "dimensionsAndFormats": [
      { "type": "Marketplace main", "dimensions": "2000x2000px", "format": "JPG" }
    ]
  }
}

Make the guidelines specific to the ${context.productCategory} category and aligned with the ${context.brandName} brand identity. Be creative, specific, and actionable.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse AI response
    let guidelines: ProductGuidelineSections;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
      const jsonText = jsonMatch[1] || text;
      guidelines = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a basic structure if parsing fails
      guidelines = {
        positioning: {
          productDescription: text.substring(0, 500),
        },
      };
    }

    return NextResponse.json({ guidelines });
  } catch (error) {
    console.error("Error generating product guidelines:", error);
    return NextResponse.json(
      { error: "Failed to generate product guidelines", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
