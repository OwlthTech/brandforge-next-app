import { brandRepository } from "@/lib/repositories";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const organizationId = cookieStore.get("organization_id")?.value;

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
      organizationId: organizationId || null,
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
    const cookieStore = await cookies();
    const organizationId = cookieStore.get("organization_id")?.value;

    console.log(`[API] GET /brands - userId: ${userId}, organizationId: ${organizationId}`);

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Filter brands by organization if one is selected
    let brands;
    if (organizationId) {
      console.log(`[API] Filtering by organization: ${organizationId}`);
      brands = await brandRepository.listForOrganization(organizationId);
    } else {
      console.log(`[API] Filtering by user: ${userId}`);
      brands = await brandRepository.listForUser(userId);
    }

    console.log(`[API] Found ${brands.length} brands`);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
