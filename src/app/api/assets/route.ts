import { NextRequest, NextResponse } from "next/server";
import { assetRepository } from "@/lib/repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const productId = searchParams.get("productId");
    const type = searchParams.get("type") as "brand-image" | "product-image" | "design-reference" | "generated-asset" | "logo" | null;

    let assets;

    if (productId) {
      assets = await assetRepository.listForProduct(productId);
    } else if (brandId && type) {
      assets = await assetRepository.listByType(brandId, type);
    } else if (brandId) {
      assets = await assetRepository.listForBrand(brandId);
    } else {
      return NextResponse.json({ error: "brandId or productId required" }, { status: 400 });
    }

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandId, productId, type, subtype, filePath, url, name, altText, metadata, notes } = body;

    if (!brandId || !type) {
      return NextResponse.json(
        { error: "brandId and type are required" },
        { status: 400 }
      );
    }

    // Use either filePath or url (for backwards compatibility and flexibility)
    const assetUrl = filePath || url;
    if (!assetUrl) {
      return NextResponse.json(
        { error: "filePath or url is required" },
        { status: 400 }
      );
    }

    const asset = await assetRepository.create({
      brandId,
      productId: productId || null,
      type,
      subtype: subtype || null,
      filePath: assetUrl,
      altText: altText || name || null,
      metadata: metadata || null,
      notes: notes || null,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, status } = body;

    if (!assetId || !status) {
      return NextResponse.json(
        { error: "assetId and status are required" },
        { status: 400 }
      );
    }

    const asset = await assetRepository.updateStatus(assetId, status);
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
