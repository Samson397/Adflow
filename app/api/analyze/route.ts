import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzePage } from "@/lib/intelligence/analyzePage";
import { pageDetailsSchema } from "@/lib/extract/types";

const analyzeSchema = z.object({
  pageDetails: pageDetailsSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageDetails } = analyzeSchema.parse(body);
    const intelligence = analyzePage(pageDetails);

    return NextResponse.json({ success: true, data: intelligence });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request"
        : error instanceof Error
          ? error.message
          : "Failed to analyze page";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
