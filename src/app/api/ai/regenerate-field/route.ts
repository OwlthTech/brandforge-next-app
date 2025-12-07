import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, productRepository, assetRepository } from "@/lib/repositories";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, productId, section, field, currentValue } = body;

    if (!brandId || !section || !field) {
      return NextResponse.json(
        { error: "brandId, section, and field are required" },
        { status: 400 }
      );
    }

    // Fetch brand context
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const assets = await assetRepository.listForBrand(brandId);

    // Build context-specific prompt
    let prompt = `You are a professional brand strategist creating brand guidelines.

Brand Information:
- Name: ${brand.name}
- Industry: ${brand.industry || "Not specified"}
- Description: ${brand.description || "Not provided"}
- Primary Color: ${brand.primaryColor}
- Secondary Color: ${brand.secondaryColor}
- Assets: ${assets.length} total assets

`;

    // Add product context if generating for product
    if (productId) {
      const product = await productRepository.findById(productId);
      if (product) {
        prompt += `Product Information:
- Name: ${product.name}
- Description: ${product.description || "Not provided"}

`;
      }
    }

    // Field-specific prompts
    const fieldPrompts: Record<string, Record<string, string>> = {
      story: {
        mission: "Write a compelling mission statement (2-3 sentences) that captures the brand's core purpose and reason for existence.",
        vision: "Write an inspiring vision statement (2-3 sentences) that describes the future the brand wants to create.",
        personality: "Describe the brand's personality traits and characteristics in 2-3 sentences.",
        targetAudience: "Define the target audience with demographics, psychographics, and key characteristics in 2-3 sentences.",
      },
      voice: {
        tone: "Describe the brand's tone of voice and communication style in 2-3 sentences.",
        style: "Define the brand's writing style, language preferences, and communication approach in 2-3 sentences.",
      },
      typography: {
        usage: "Provide guidelines for when and how to use this font, including appropriate contexts and best practices (2-3 sentences).",
      },
      logo: {
        variations: "Describe the different logo variations available (primary, secondary, monochrome, etc.) and when to use each (3-4 sentences).",
        clearSpace: "Define the minimum clear space requirements around the logo to maintain visibility and impact (2-3 sentences).",
        minimumSize: "Specify the minimum size requirements for the logo in both print and digital formats (2-3 sentences).",
        placement: "Provide guidelines for proper logo placement on various materials and contexts (3-4 sentences).",
        incorrectUsage: "List common mistakes and incorrect uses of the logo that should be avoided (3-4 sentences).",
      },
      imagery: {
        photographyStyle: "Describe the photography style that aligns with the brand, including subjects, composition, lighting, and mood (3-4 sentences).",
        illustrationStyle: "Define the illustration style, including techniques, color usage, and aesthetic approach (3-4 sentences).",
        iconStyle: "Specify the icon style, including line weight, complexity, and visual characteristics (2-3 sentences).",
        imageGuidelines: "Provide general guidelines for selecting and using images that represent the brand appropriately (3-4 sentences).",
      },
    };

    const specificPrompt = fieldPrompts[section]?.[field] || `Generate appropriate content for the ${field} field in the ${section} section.`;

    prompt += `Current value: ${currentValue || "None"}

Task: ${specificPrompt}

Provide ONLY the text content, no JSON, no markdown, no code blocks. Just the plain text that should go in this field.`;

    const model = initAIClient();

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json({ value: text.trim() });
  } catch (error) {
    console.error("Error regenerating field:", error);
    return NextResponse.json(
      { 
        error: "Failed to regenerate field", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
