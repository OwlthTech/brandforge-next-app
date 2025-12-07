import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { initAIClient } from "@/lib/ai/client";
import { brandRepository, assetRepository } from "@/lib/repositories";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, section, currentContent } = body;

    if (!brandId || !section) {
      return NextResponse.json(
        { error: "brandId and section are required" },
        { status: 400 }
      );
    }

    // Fetch brand data
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Fetch brand assets
    const assets = await assetRepository.listForBrand(brandId);
    const logoAssets = assets.filter(a => a.type === "logo");
    const brandImages = assets.filter(a => a.type === "brand-image");

    const model = initAIClient();

    const prompts: Record<string, string> = {
      story: `Generate a comprehensive brand story for ${brand.name} (${brand.industry}). Include: mission (clear purpose statement), vision (aspirational future state), values (3-5 core values), personality (brand character traits), and targetAudience (primary customer profile). Description: ${brand.description}. Return ONLY valid JSON matching this structure: {"mission": "...", "vision": "...", "values": ["...", "..."], "personality": "...", "targetAudience": "..."}`,
      
      voice: `Generate brand voice guidelines for ${brand.name}. Include: tone (communication style), style (writing approach), dos (3-5 communication guidelines), donts (3-5 things to avoid), examples (2-3 sample phrases). Return ONLY valid JSON: {"tone": "...", "style": "...", "dos": ["..."], "donts": ["..."], "examples": ["..."]}`,
      
      palette: `Generate color palette for ${brand.name}. Primary: ${brand.primaryColor}, Secondary: ${brand.secondaryColor}. Include usage guidelines and suggest accent colors. Return ONLY valid JSON: {"primary": {"hex": "...", "usage": "..."}, "secondary": {"hex": "...", "usage": "..."}, "accent": [{"hex": "...", "usage": "..."}]}`,
      
      typography: `Generate typography guidelines for ${brand.name} (${brand.industry}). Include primary and secondary font recommendations with usage rules. Return ONLY valid JSON: {"primary": {"fontFamily": "...", "usage": "...", "sizes": {"h1": "...", "body": "..."}}, "secondary": {"fontFamily": "...", "usage": "..."}}`,
      
      logo: `Generate logo usage guidelines for ${brand.name}. We have ${logoAssets.length} logo variations. Include: variations (different versions), clearSpace (minimum spacing), minSize (minimum dimensions), placement (usage contexts), incorrectUsage (what to avoid). Return ONLY valid JSON.`,
      
      imagery: `Generate imagery guidelines for ${brand.name} (${brand.industry}). Include photography style, illustration style, icon style, and general image usage rules. Return ONLY valid JSON: {"photographyStyle": "...", "illustrationStyle": "...", "iconStyle": "...", "imageGuidelines": "..."}`
    };

    const prompt = prompts[section] || `Generate ${section} section for ${brand.name}`;

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
    });

    // Parse response
    let sectionContent;
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, text];
      const jsonText = jsonMatch[1] || text;
      sectionContent = JSON.parse(jsonText.trim());
    } catch {
      sectionContent = { value: text };
    }

    return NextResponse.json({ [section]: sectionContent });
  } catch (error) {
    console.error("Error regenerating section:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
