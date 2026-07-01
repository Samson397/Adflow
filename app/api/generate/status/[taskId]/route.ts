import { NextResponse } from "next/server";
import { getMediaTaskStatus, getMusicTaskStatus, isPoyoConfigured } from "@/lib/poyo/client";
import { getModelById } from "@/lib/poyo/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    if (!isPoyoConfigured()) {
      return NextResponse.json(
        { success: false, error: "POYO_API_KEY is not configured" },
        { status: 503 },
      );
    }

    const { taskId } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const modelId = searchParams.get("modelId");

    const model = modelId ? getModelById(modelId) : undefined;
    const isMusic = category === "music" || model?.category === "music";

    const task = isMusic
      ? await getMusicTaskStatus(taskId)
      : await getMediaTaskStatus(taskId);

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.task_id,
        status: task.status,
        progress: task.progress ?? null,
        files: task.files ?? [],
        errorMessage: task.error_message ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch task status";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
