import { brandRepository } from "@/lib/repositories";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      description, 
      industry, 
      primaryColor, 
      secondaryColor,
      websiteUrl,
      googleMyBusinessUrl,
      socialMediaUrls,
    } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 }
      );
    }

    const brand = await brandRepository.create({
      userId,
      name,
      description,
      industry,
      primaryColor,
      secondaryColor,
      websiteUrl,
      googleMyBusinessUrl,
      socialMediaUrls,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Failed to create brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const brands = await brandRepository.listForUser(userId);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
