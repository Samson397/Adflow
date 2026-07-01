import type { PlatformSpec } from "../types";

export const META_LIMITS = {
  headline: 40,
  primaryText: 125,
  linkDescription: 30,
} as const;

export const metaSpecs: PlatformSpec[] = [
  {
    platform: "meta",
    format: "meta_single_image",
    label: "Meta — Single image",
    limits: [
      { field: "headline", max: META_LIMITS.headline, label: "Headline" },
      { field: "primaryText", max: META_LIMITS.primaryText, label: "Primary text" },
      { field: "description", max: META_LIMITS.linkDescription, label: "Link description" },
    ],
  },
  {
    platform: "meta",
    format: "meta_carousel",
    label: "Meta — Carousel",
    limits: [
      { field: "headline", max: META_LIMITS.headline, label: "Headline" },
      { field: "primaryText", max: META_LIMITS.primaryText, label: "Primary text" },
      { field: "description", max: META_LIMITS.linkDescription, label: "Link description" },
    ],
  },
];

export function truncateMetaField(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

export function validateMetaVariant(variant: {
  headline: string;
  primaryText: string;
  description?: string;
}): { headline: string; primaryText: string; description?: string } {
  return {
    headline: truncateMetaField(variant.headline, META_LIMITS.headline),
    primaryText: truncateMetaField(variant.primaryText, META_LIMITS.primaryText),
    description: variant.description
      ? truncateMetaField(variant.description, META_LIMITS.linkDescription)
      : undefined,
  };
}

export function exportMetaVariant(variant: {
  headline: string;
  primaryText: string;
  description?: string;
  cta?: string;
  imageUrl?: string;
}) {
  return {
    platform: "meta",
    headline: variant.headline,
    primary_text: variant.primaryText,
    link_description: variant.description ?? "",
    call_to_action: variant.cta ?? "LEARN_MORE",
    image_url: variant.imageUrl ?? "",
  };
}
