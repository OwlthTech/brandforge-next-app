import { NextRequest, NextResponse } from "next/server";
import { assetRepository } from "@/lib/repositories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await request.json();
    const { subtype, altText } = body;

    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const updatedAsset = await assetRepository.update(assetId, {
      subtype: subtype || asset.subtype,
      altText: altText !== undefined ? altText : asset.altText,
    });

    return NextResponse.json({ asset: updatedAsset });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    await assetRepository.delete(assetId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
