import { z } from "zod";

export const platformSchema = z.enum(["meta", "google"]);
export const formatSchema = z.enum([
  "meta_single_image",
  "meta_carousel",
  "google_responsive_search",
  "google_display",
]);

export type Platform = z.infer<typeof platformSchema>;
export type AdFormat = z.infer<typeof formatSchema>;

export const adVariantSchema = z.object({
  id: z.string(),
  platform: platformSchema,
  format: formatSchema,
  headline: z.string(),
  primaryText: z.string(),
  description: z.string().optional(),
  cta: z.string().optional(),
  imageUrl: z.string().url().optional(),
  headlines: z.array(z.string()).optional(),
  descriptions: z.array(z.string()).optional(),
});

export type AdVariant = z.infer<typeof adVariantSchema>;

export const generateAdsRequestSchema = z.object({
  pageDetails: z.object({
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
    images: z.array(z.string().url()),
    favicon: z.string().url().optional(),
    siteName: z.string().optional(),
    price: z.string().optional(),
    currency: z.string().optional(),
    ctaText: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    language: z.string().optional(),
  }),
  platforms: z.array(platformSchema).min(1),
  formats: z.array(formatSchema).min(1),
});

export type GenerateAdsRequest = z.infer<typeof generateAdsRequestSchema>;

export interface FieldLimit {
  field: string;
  max: number;
  label: string;
}

export interface PlatformSpec {
  platform: Platform;
  format: AdFormat;
  label: string;
  limits: FieldLimit[];
}
