import { NextResponse } from "next/server";
import { getTaskStatus, isAiVideoApiConfigured } from "@/lib/aivideoapi/client";
import { getModelById } from "@/lib/aivideoapi/models";
import type { CreativeCategory } from "@/lib/aivideoapi/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    if (!isAiVideoApiConfigured()) {
      return NextResponse.json(
        { success: false, error: "AIVIDEOAPI_API_KEY is not configured" },
        { status: 503 },
      );
    }

    const { taskId } = await params;
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") as CreativeCategory | null;
    const modelId = searchParams.get("modelId");
    const model = modelId ? getModelById(modelId) : undefined;
    const category = categoryParam ?? model?.category ?? "video";

    const task = await getTaskStatus(taskId, category);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch task status";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
