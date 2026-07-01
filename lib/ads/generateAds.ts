import OpenAI from "openai";
import { z } from "zod";
import type { AdFormat, AdVariant, GenerateAdsRequest, Platform } from "./types";
import { validateMetaVariant } from "./platforms/meta";
import {
  validateGoogleDisplayVariant,
  validateGoogleSearchVariant,
} from "./platforms/google";

const openaiVariantSchema = z.object({
  variants: z.array(
    z.object({
      platform: z.enum(["meta", "google"]),
      format: z.string(),
      headline: z.string().optional(),
      primaryText: z.string().optional(),
      description: z.string().optional(),
      cta: z.string().optional(),
      headlines: z.array(z.string()).optional(),
      descriptions: z.array(z.string()).optional(),
    }),
  ),
});

function buildPrompt(request: GenerateAdsRequest): string {
  const { pageDetails, platforms, formats } = request;
  const image = pageDetails.images[0] ?? "none";

  return `You are an expert performance marketer. Generate ad copy variants for the following page.

Page URL: ${pageDetails.url}
Title: ${pageDetails.title}
Description: ${pageDetails.description}
Site name: ${pageDetails.siteName ?? "N/A"}
Price: ${pageDetails.price ? `${pageDetails.currency ?? ""} ${pageDetails.price}` : "N/A"}
CTA hint: ${pageDetails.ctaText ?? "Learn more"}
Primary image: ${image}

Target platforms: ${platforms.join(", ")}
Target formats: ${formats.join(", ")}

Rules:
- Meta single image / carousel: headline max 40 chars, primary text max 125 chars, link description max 30 chars
- Google responsive search: provide 3-5 headlines (max 30 chars each) and 2-3 descriptions (max 90 chars each)
- Google display: headline max 30 chars, description max 90 chars
- Produce exactly 2 variants per requested platform+format combination
- Use compelling, conversion-focused language
- Return valid JSON only`;
}

function normalizeVariant(
  raw: z.infer<typeof openaiVariantSchema>["variants"][number],
  format: AdFormat,
  imageUrl?: string,
  index = 0,
): AdVariant | null {
  const id = `${raw.platform}-${format}-${index}-${crypto.randomUUID().slice(0, 8)}`;

  if (raw.platform === "meta") {
    if (!raw.headline || !raw.primaryText) return null;
    const validated = validateMetaVariant({
      headline: raw.headline,
      primaryText: raw.primaryText,
      description: raw.description,
    });
    return {
      id,
      platform: "meta",
      format: format as "meta_single_image" | "meta_carousel",
      headline: validated.headline,
      primaryText: validated.primaryText,
      description: validated.description,
      cta: raw.cta ?? "Learn More",
      imageUrl,
    };
  }

  if (format === "google_responsive_search") {
    if (!raw.headlines?.length || !raw.descriptions?.length) return null;
    const validated = validateGoogleSearchVariant({
      headlines: raw.headlines,
      descriptions: raw.descriptions,
    });
    return {
      id,
      platform: "google",
      format: "google_responsive_search",
      headline: validated.headlines[0] ?? "",
      primaryText: validated.descriptions[0] ?? "",
      headlines: validated.headlines,
      descriptions: validated.descriptions,
      imageUrl,
    };
  }

  if (!raw.headline || !raw.description) return null;
  const validated = validateGoogleDisplayVariant({
    headline: raw.headline,
    description: raw.description,
  });
  return {
    id,
    platform: "google",
    format: "google_display",
    headline: validated.headline,
    primaryText: validated.description,
    description: validated.description,
    cta: raw.cta ?? "Learn More",
    imageUrl,
  };
}

function fallbackVariants(request: GenerateAdsRequest): AdVariant[] {
  const { pageDetails, formats } = request;
  const imageUrl = pageDetails.images[0];
  const title = pageDetails.title.slice(0, 40) || "Discover more";
  const desc = pageDetails.description.slice(0, 125) || "Shop now and explore our latest offers.";
  const variants: AdVariant[] = [];

  for (const format of formats) {
    if (format.startsWith("meta")) {
      for (let i = 0; i < 2; i++) {
        const validated = validateMetaVariant({
          headline: i === 0 ? title : `${title} — Shop now`,
          primaryText: desc,
          description: pageDetails.siteName?.slice(0, 30),
        });
        variants.push({
          id: `meta-${format}-${i}`,
          platform: "meta",
          format: format as "meta_single_image" | "meta_carousel",
          ...validated,
          cta: "Learn More",
          imageUrl,
        });
      }
    }
    if (format === "google_responsive_search") {
      for (let i = 0; i < 2; i++) {
        const validated = validateGoogleSearchVariant({
          headlines: [title, pageDetails.siteName ?? "Official site", "Shop today"].map((h) =>
            h.slice(0, 30),
          ),
          descriptions: [desc, pageDetails.description.slice(0, 90)].filter(Boolean),
        });
        variants.push({
          id: `google-search-${i}`,
          platform: "google",
          format: "google_responsive_search",
          headline: validated.headlines[0] ?? "",
          primaryText: validated.descriptions[0] ?? "",
          headlines: validated.headlines,
          descriptions: validated.descriptions,
          imageUrl,
        });
      }
    }
    if (format === "google_display") {
      for (let i = 0; i < 2; i++) {
        const validated = validateGoogleDisplayVariant({
          headline: title,
          description: pageDetails.description.slice(0, 90) || desc,
        });
        variants.push({
          id: `google-display-${i}`,
          platform: "google",
          format: "google_display",
          headline: validated.headline,
          primaryText: validated.description,
          description: validated.description,
          imageUrl,
        });
      }
    }
  }

  return variants;
}

export async function generateAds(request: GenerateAdsRequest): Promise<AdVariant[]> {
  const imageUrl = request.pageDetails.images[0];
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackVariants(request);
  }

  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Return JSON: { variants: [{ platform, format, headline?, primaryText?, description?, cta?, headlines?, descriptions? }] }",
      },
      { role: "user", content: buildPrompt(request) },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return fallbackVariants(request);
  }

  let parsed: z.infer<typeof openaiVariantSchema>;
  try {
    parsed = openaiVariantSchema.parse(JSON.parse(content));
  } catch {
    return fallbackVariants(request);
  }

  const variants: AdVariant[] = [];
  const formatCounts = new Map<string, number>();

  for (const raw of parsed.variants) {
    const format = (raw.format || request.formats[0]) as AdFormat;
    const count = formatCounts.get(format) ?? 0;
    const normalized = normalizeVariant(raw, format, imageUrl, count);
    if (normalized) {
      variants.push(normalized);
      formatCounts.set(format, count + 1);
    }
  }

  if (variants.length === 0) {
    return fallbackVariants(request);
  }

  const byPlatform = (p: Platform) => variants.filter((v) => v.platform === p);
  const result: AdVariant[] = [];
  for (const platform of request.platforms) {
    const platformVariants = byPlatform(platform);
    if (platformVariants.length >= 2) {
      result.push(...platformVariants.slice(0, 2));
    } else {
      result.push(...platformVariants);
      const needed = 2 - platformVariants.length;
      const extras = fallbackVariants({
        ...request,
        platforms: [platform],
        formats: request.formats.filter((f) =>
          platform === "meta" ? f.startsWith("meta") : f.startsWith("google"),
        ),
      }).slice(0, needed);
      result.push(...extras);
    }
  }

  return result.length > 0 ? result : fallbackVariants(request);
}
