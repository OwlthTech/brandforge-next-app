import { NextRequest, NextResponse } from "next/server";
import { guidelineRepository } from "@/lib/repositories";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guidelineId: string }> }
) {
  try {
    const { guidelineId } = await params;

    const history = await guidelineRepository.getHistory(guidelineId);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching guideline history:", error);
    return NextResponse.json(
      { error: "Failed to fetch guideline history" },
      { status: 500 }
    );
  }
}
