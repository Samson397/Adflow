import type { PageDetails } from "@/lib/extract/types";
import type { CreativeModel } from "./types";

export function buildPromptFromPage(page: PageDetails, userPrompt?: string): string {
  if (userPrompt?.trim()) return userPrompt.trim();

  const parts = [
    page.title,
    page.description,
    page.siteName ? `Brand: ${page.siteName}` : null,
    page.price ? `Price: ${page.currency ?? ""} ${page.price}`.trim() : null,
    page.ctaText ? `CTA: ${page.ctaText}` : null,
  ].filter(Boolean);

  return parts.join(". ") || "A premium product advertisement";
}

export function buildModelInput(
  model: CreativeModel,
  prompt: string,
  imageUrl?: string,
): Record<string, unknown> {
  const hasImage = Boolean(imageUrl);

  switch (model.id) {
    case "seedance-2":
    case "seedance-2-fast":
      return {
        prompt,
        resolution: "720p",
        duration: 8,
        aspect_ratio: "16:9",
        generate_audio: true,
        ...(hasImage ? { first_frame_url: imageUrl } : {}),
      };

    case "veo3.1-fast":
      return {
        prompt,
        duration: 8,
        aspect_ratio: "16:9",
        resolution: "720p",
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "sora-2-official":
      return {
        prompt,
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "kling-3.0-standard":
      return {
        prompt,
        multi_shots: false,
        duration: 5,
        sound: true,
        aspect_ratio: "16:9",
        image_urls: hasImage ? [imageUrl] : [],
      };

    case "kling-2.6":
      return {
        prompt,
        sound: true,
        aspect_ratio: "16:9",
        duration: 5,
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "happy-horse-1-1":
    case "happy-horse":
    case "wan-2-7-video":
    case "wan-2-6":
    case "grok-imagine":
      return {
        prompt,
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "gpt-image-2":
      return {
        prompt,
        quality: "medium",
        size: "16:9",
        resolution: "2K",
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "nano-banana-2-new":
      return {
        prompt,
        size: "16:9",
        resolution: "2K",
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "nano-banana":
      return {
        prompt,
        size: "16:9",
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "seedream-5-0-lite":
      return {
        prompt,
        ...(hasImage ? { image_urls: [imageUrl] } : {}),
      };

    case "suno-v5-5":
    case "suno-v5":
      return {
        prompt,
        custom_mode: false,
        instrumental: false,
        mv: model.musicVersion ?? "V5",
      };

    default:
      return { prompt };
  }
}
