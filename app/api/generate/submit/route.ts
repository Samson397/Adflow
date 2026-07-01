import { NextResponse } from "next/server";
import { z } from "zod";
import { buildModelInput } from "@/lib/poyo/buildInput";
import { isPoyoConfigured, submitGenerationTask } from "@/lib/poyo/client";
import { getModelById } from "@/lib/poyo/models";

const submitSchema = z.object({
  modelId: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isPoyoConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "POYO_API_KEY is not configured. Add your PoYo API key to environment variables.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { modelId, prompt, imageUrl } = submitSchema.parse(body);
    const model = getModelById(modelId);

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Unknown model" },
        { status: 400 },
      );
    }

    const input = buildModelInput(model, prompt, imageUrl);
    const task = await submitGenerationTask(model, input);

    return NextResponse.json({
      success: true,
      data: {
        taskId: task.task_id,
        status: task.status,
        category: model.category,
        modelId: model.id,
        modelLabel: model.label,
      },
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request"
        : error instanceof Error
          ? error.message
          : "Failed to submit generation";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
