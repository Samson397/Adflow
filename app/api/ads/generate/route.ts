import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAds } from "@/lib/ads/generateAds";
import { generateAdsRequestSchema } from "@/lib/ads/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = generateAdsRequestSchema.parse(body);
    const variants = await generateAds(payload);

    return NextResponse.json({
      success: true,
      data: { variants },
      usedFallback: !process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request"
        : error instanceof Error
          ? error.message
          : "Failed to generate ads";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
