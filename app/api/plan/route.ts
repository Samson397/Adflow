import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCampaignPlan } from "@/lib/campaign/planCampaign";
import { pageDetailsSchema } from "@/lib/extract/types";

const planSchema = z.object({
  pageDetails: pageDetailsSchema,
  brief: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageDetails, brief } = planSchema.parse(body);
    const plan = buildCampaignPlan(pageDetails, brief ?? "");

    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request"
        : error instanceof Error
          ? error.message
          : "Failed to build campaign plan";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
