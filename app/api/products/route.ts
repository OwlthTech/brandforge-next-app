import { productRepository } from "@/lib/repositories";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, name, description, category, tags } = body;

    if (!brandId || !name) {
      return NextResponse.json(
        { error: "brandId and name are required" },
        { status: 400 }
      );
    }

    const product = await productRepository.create({
      brandId,
      name,
      description,
      category,
      tags: tags || [],
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    const products = await productRepository.listForBrand(brandId);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
