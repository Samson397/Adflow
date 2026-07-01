import { NextResponse } from "next/server";
import { getCreditsBalance, isAiVideoApiConfigured } from "@/lib/aivideoapi/client";

export async function GET() {
  try {
    if (!isAiVideoApiConfigured()) {
      return NextResponse.json(
        { success: false, error: "AIVIDEOAPI_API_KEY is not configured" },
        { status: 503 },
      );
    }

    const credits = await getCreditsBalance();

    return NextResponse.json({ success: true, data: credits });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch credits";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
