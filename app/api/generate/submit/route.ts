import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveGeneration } from "@/lib/aivideoapi/buildInput";
import { isAiVideoApiConfigured, submitGenerationTask } from "@/lib/aivideoapi/client";
import { getModelById } from "@/lib/aivideoapi/models";

const submitSchema = z.object({
  modelId: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  instrumental: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isAiVideoApiConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AIVIDEOAPI_API_KEY is not configured. Add your aivideoapi.ai key to environment variables.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const { modelId, prompt, imageUrl, audioUrl, instrumental } = submitSchema.parse(body);
    const model = getModelById(modelId);

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Unknown model" },
        { status: 400 },
      );
    }

    const { endpoint, apiModel, input } = resolveGeneration(
      model,
      prompt,
      imageUrl,
      audioUrl,
      instrumental,
    );
    const taskId = await submitGenerationTask(endpoint, apiModel, input);

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        status: "pending",
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
