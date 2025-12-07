import { NextRequest } from "next/server";
import { streamText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, assetRepository } from "@/lib/repositories";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, brandId } = body;

    if (!brandId) {
      return new Response(
        JSON.stringify({ error: "brandId is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch brand context
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return new Response(
        JSON.stringify({ error: "Brand not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const assets = await assetRepository.listForBrand(brandId);

    const systemPrompt = `You are a professional brand strategist helping to create brand guidelines.

Brand Context:
- Name: ${brand.name}
- Industry: ${brand.industry || "Not specified"}
- Description: ${brand.description || "Not provided"}
- Colors: Primary ${brand.primaryColor}, Secondary ${brand.secondaryColor}
- Assets: ${assets.length} total assets

When generating guidelines, always return valid JSON matching this structure:
{
  "story": { "mission": "", "vision": "", "values": [], "personality": "", "targetAudience": "" },
  "voice": { "tone": "", "style": "", "dos": [], "donts": [], "examples": [] },
  "palette": { "primary": {"hex": "", "usage": ""}, "secondary": {"hex": "", "usage": ""}, "accent": [] },
  "typography": { "primary": {"fontFamily": "", "usage": "", "sizes": {}}, "secondary": {"fontFamily": "", "usage": ""} },
  "logo": { "variations": "", "clearSpace": "", "minimumSize": "", "placement": "", "incorrectUsage": "" },
  "imagery": { "photographyStyle": "", "illustrationStyle": "", "iconStyle": "", "imageGuidelines": "" }
}

You can generate partial sections based on user requests, but always use valid JSON structure.`;

    const model = initAIClient();

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chat guideline generation:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
