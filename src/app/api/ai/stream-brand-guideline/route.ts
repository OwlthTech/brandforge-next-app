import { NextRequest } from "next/server";
import { streamText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, assetRepository } from "@/lib/repositories";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, overrides } = body;

    if (!brandId) {
      return new Response(
        JSON.stringify({ error: "brandId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch brand data
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch brand assets
    const assets = await assetRepository.listForBrand(brandId);
    const logoAssets = assets.filter(a => a.type === "logo");
    const brandImages = assets.filter(a => a.type === "brand-image");

    const context = {
      brandName: brand.name,
      industry: brand.industry,
      description: brand.description,
      primaryColor: brand.primaryColor,
      secondaryColor: brand.secondaryColor,
      logoCount: logoAssets.length,
      imageCount: brandImages.length,
      ...overrides,
    };

    const model = initAIClient();

    const prompt = `You are a professional brand strategist. Generate comprehensive brand guidelines for the following brand:

Brand Name: ${context.brandName}
Industry: ${context.industry || "Not specified"}
Description: ${context.description || "Not provided"}
Primary Color: ${context.primaryColor || "Not specified"}
Secondary Color: ${context.secondaryColor || "Not specified"}
Available Assets: ${context.logoCount} logos, ${context.imageCount} images

Generate a complete set of brand guidelines in valid JSON format with these sections:

{
  "story": {
    "mission": "Clear mission statement",
    "vision": "Aspirational vision statement",
    "values": ["value1", "value2", "value3"],
    "personality": "Brand personality description",
    "targetAudience": "Primary audience description"
  },
  "voice": {
    "tone": "Communication tone description",
    "style": "Writing style guidelines",
    "dos": ["guideline1", "guideline2"],
    "donts": ["avoid1", "avoid2"],
    "examples": ["example1", "example2"]
  },
  "palette": {
    "primary": { "hex": "${context.primaryColor || "#000000"}", "usage": "Usage guidelines" },
    "secondary": { "hex": "${context.secondaryColor || "#FFFFFF"}", "usage": "Usage guidelines" },
    "accent": [{ "hex": "#color", "usage": "Usage guidelines" }]
  },
  "typography": {
    "primary": {
      "fontFamily": "Font name",
      "usage": "When to use",
      "sizes": { "h1": "Size", "body": "Size" }
    },
    "secondary": {
      "fontFamily": "Font name",
      "usage": "When to use"
    }
  },
  "logo": {
    "variations": "Logo variation descriptions",
    "clearSpace": "Clear space requirements",
    "minimumSize": "Minimum size specifications",
    "placement": "Placement guidelines",
    "incorrectUsage": "What to avoid"
  },
  "imagery": {
    "photographyStyle": "Photography style description",
    "illustrationStyle": "Illustration style if applicable",
    "iconStyle": "Icon style description",
    "imageGuidelines": "General image usage guidelines"
  }
}

Make the guidelines specific to the ${context.industry} industry and aligned with the brand description. Be creative and professional.`;

    const result = await streamText({
      model,
      prompt,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error streaming brand guidelines:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate brand guidelines",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
