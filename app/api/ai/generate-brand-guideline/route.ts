import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, assetRepository } from "@/lib/repositories";
import type { BrandGuidelineSections } from "@/types/guideline";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, overrides } = body;

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Fetch brand data
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Fetch brand assets for context
    const assets = await assetRepository.listForBrand(brandId);
    const logoAssets = assets.filter(a => a.type === "logo");
    const brandImages = assets.filter(a => a.type === "brand-image");

    // Build context for AI
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

    // Get AI model
    const model = initAIClient();

    // Generate brand guidelines
    const prompt = `You are a professional brand strategist. Generate comprehensive brand guidelines for the following brand:

Brand Name: ${context.brandName}
Industry: ${context.industry || "Not specified"}
Description: ${context.description || "Not provided"}
Primary Color: ${context.primaryColor}
Secondary Color: ${context.secondaryColor}

Generate detailed brand guidelines in JSON format with the following structure:
{
  "story": {
    "mission": "Brand mission statement",
    "vision": "Brand vision statement",
    "values": ["value1", "value2", "value3"],
    "brandPersonality": "Brand personality description",
    "targetAudience": "Target audience description"
  },
  "voice": {
    "toneAttributes": ["attribute1", "attribute2", "attribute3"],
    "writingStyle": "Writing style description",
    "dosList": ["Do this", "Do that"],
    "dontsList": ["Don't do this", "Don't do that"],
    "exampleCopy": "Example of on-brand copy"
  },
  "palette": {
    "primaryColors": [
      { "name": "Primary", "hex": "${context.primaryColor}", "usage": "Main brand color for headers and CTAs" }
    ],
    "secondaryColors": [
      { "name": "Secondary", "hex": "${context.secondaryColor}", "usage": "Supporting color for backgrounds" }
    ],
    "colorGuidelines": "Guidelines for color usage"
  },
  "typography": {
    "primaryFont": {
      "name": "Recommended primary font",
      "weights": ["400", "600", "700"],
      "usage": "For headlines and important text"
    },
    "secondaryFont": {
      "name": "Recommended secondary font",
      "weights": ["400", "500"],
      "usage": "For body text"
    },
    "typographyGuidelines": "Typography usage guidelines"
  },
  "logo": {
    "logoVariations": ["Primary logo", "Secondary logo", "Icon only"],
    "clearSpace": "Minimum clear space requirements",
    "minimumSize": "Minimum size specifications",
    "dosList": ["Proper logo usage"],
    "dontsList": ["Logo misuse to avoid"]
  },
  "imagery": {
    "photographyStyle": "Photography style description",
    "illustrationStyle": "Illustration style if applicable",
    "iconStyle": "Icon style description",
    "imageGuidelines": "General image usage guidelines"
  }
}

Make the guidelines specific to the ${context.industry} industry and aligned with the brand description. Be creative and professional.`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse AI response
    let guidelines: BrandGuidelineSections;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
      const jsonText = jsonMatch[1] || text;
      guidelines = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a basic structure if parsing fails
      guidelines = {
        story: {
          mission: "AI generation in progress - please refine manually",
          brandPersonality: text.substring(0, 500),
        },
      };
    }

    return NextResponse.json({ guidelines });
  } catch (error) {
    console.error("Error generating brand guidelines:", error);
    return NextResponse.json(
      { error: "Failed to generate brand guidelines", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
