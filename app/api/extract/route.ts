import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchPageHtml } from "@/lib/extract/fetchPage";
import { parseMetadata } from "@/lib/extract/parseMetadata";
import { pageDetailsSchema } from "@/lib/extract/types";
import { validatePublicUrl } from "@/lib/utils/validation";

const extractRequestSchema = z.object({
  url: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = extractRequestSchema.parse(body);
    const validatedUrl = await validatePublicUrl(url);
    const html = await fetchPageHtml(validatedUrl.href);
    const pageDetails = parseMetadata(html, validatedUrl.href);
    const parsed = pageDetailsSchema.parse(pageDetails);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request"
        : error instanceof Error
          ? error.message
          : "Failed to extract page details";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
