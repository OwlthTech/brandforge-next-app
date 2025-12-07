import { NextRequest, NextResponse } from "next/server";
import { guidelineRepository } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const productId = searchParams.get("productId");
    const type = searchParams.get("type");

    if (!brandId) {
      return NextResponse.json({ error: "brandId required" }, { status: 400 });
    }

    let guidelines;
    
    if (type === "brand") {
      guidelines = await guidelineRepository.listForBrand(brandId);
    } else if (type === "product" && productId) {
      guidelines = await guidelineRepository.listForProduct(productId);
    } else {
      // Return all guidelines for the brand
      guidelines = await guidelineRepository.listForBrand(brandId);
    }

    return NextResponse.json({ guidelines });
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    return NextResponse.json({ error: "Failed to fetch guidelines" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, productId, title, type, content, version, status } = body;

    if (!brandId || !title || !type || !content) {
      return NextResponse.json(
        { error: "brandId, title, type, and content are required" },
        { status: 400 }
      );
    }

    const guideline = await guidelineRepository.create({
      brandId,
      productId: productId || null,
      title,
      type,
      content,
      version: version || 1,
      status: status || "draft",
    });

    return NextResponse.json({ guideline }, { status: 201 });
  } catch (error) {
    console.error("Error creating guideline:", error);
    return NextResponse.json({ error: "Failed to create guideline" }, { status: 500 });
  }
}
