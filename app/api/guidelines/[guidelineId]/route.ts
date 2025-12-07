import { NextRequest, NextResponse } from "next/server";
import { guidelineRepository } from "@/lib/repositories";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guidelineId: string }> }
) {
  try {
    const { guidelineId } = await params;

    const guideline = await guidelineRepository.findById(guidelineId);

    if (!guideline) {
      return NextResponse.json(
        { error: "Guideline not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ guideline });
  } catch (error) {
    console.error("Error fetching guideline:", error);
    return NextResponse.json(
      { error: "Failed to fetch guideline" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guidelineId: string }> }
) {
  try {
    const { guidelineId } = await params;
    const body = await request.json();
    const { title, content, status } = body;

    const guideline = await guidelineRepository.update(guidelineId, {
      title,
      content,
      status,
    });

    return NextResponse.json({ guideline });
  } catch (error) {
    console.error("Error updating guideline:", error);
    return NextResponse.json(
      { error: "Failed to update guideline" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ guidelineId: string }> }
) {
  try {
    const { guidelineId } = await params;

    await guidelineRepository.delete(guidelineId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guideline:", error);
    return NextResponse.json(
      { error: "Failed to delete guideline" },
      { status: 500 }
    );
  }
}
