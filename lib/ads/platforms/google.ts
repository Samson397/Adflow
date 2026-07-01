import type { PlatformSpec } from "../types";

export const GOOGLE_LIMITS = {
  headline: 30,
  description: 90,
  maxHeadlines: 15,
  maxDescriptions: 4,
} as const;

export const googleSpecs: PlatformSpec[] = [
  {
    platform: "google",
    format: "google_responsive_search",
    label: "Google — Responsive search",
    limits: [
      { field: "headlines", max: GOOGLE_LIMITS.headline, label: "Each headline" },
      { field: "descriptions", max: GOOGLE_LIMITS.description, label: "Each description" },
    ],
  },
  {
    platform: "google",
    format: "google_display",
    label: "Google — Display",
    limits: [
      { field: "headline", max: GOOGLE_LIMITS.headline, label: "Headline" },
      { field: "description", max: GOOGLE_LIMITS.description, label: "Description" },
    ],
  },
];

export function truncateGoogleField(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

export function validateGoogleSearchVariant(variant: {
  headlines: string[];
  descriptions: string[];
}) {
  return {
    headlines: variant.headlines
      .slice(0, GOOGLE_LIMITS.maxHeadlines)
      .map((h) => truncateGoogleField(h, GOOGLE_LIMITS.headline)),
    descriptions: variant.descriptions
      .slice(0, GOOGLE_LIMITS.maxDescriptions)
      .map((d) => truncateGoogleField(d, GOOGLE_LIMITS.description)),
  };
}

export function validateGoogleDisplayVariant(variant: {
  headline: string;
  description: string;
}) {
  return {
    headline: truncateGoogleField(variant.headline, GOOGLE_LIMITS.headline),
    description: truncateGoogleField(variant.description, GOOGLE_LIMITS.description),
  };
}

export function exportGoogleSearchVariant(variant: {
  headlines: string[];
  descriptions: string[];
}) {
  return {
    platform: "google",
    type: "responsive_search",
    headlines: variant.headlines,
    descriptions: variant.descriptions,
  };
}

export function exportGoogleDisplayVariant(variant: {
  headline: string;
  description: string;
  imageUrl?: string;
}) {
  return {
    platform: "google",
    type: "display",
    headline: variant.headline,
    description: variant.description,
    image_url: variant.imageUrl ?? "",
  };
}
