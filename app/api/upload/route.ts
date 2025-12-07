import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const brandId = formData.get("brandId") as string;
    const productId = formData.get("productId") as string | null;
    const assetType = formData.get("assetType") as string;
    const subtype = formData.get("subtype") as string | null;

    if (!file || !brandId || !assetType) {
      return NextResponse.json(
        { error: "file, brandId, and assetType are required" },
        { status: 400 }
      );
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload path
    let uploadDir: string;
    if (productId) {
      uploadDir = join(process.cwd(), "public", "uploads", "products", productId, subtype || assetType);
    } else {
      uploadDir = join(process.cwd(), "public", "uploads", "brands", brandId, assetType);
    }

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename using UUID
    const fileExtension = file.name.split('.').pop() || '';
    const filename = `${randomUUID()}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Write file to disk
    await writeFile(filepath, buffer);

    // Return public URL path
    const publicPath = productId
      ? `/uploads/products/${productId}/${subtype || assetType}/${filename}`
      : `/uploads/brands/${brandId}/${assetType}/${filename}`;

    return NextResponse.json({
      success: true,
      filePath: publicPath,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
