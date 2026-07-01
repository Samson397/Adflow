import type { PageDetails } from "@/lib/extract/types";
import type { CreativeCategory, CreativeModel } from "./types";

export interface ResolvedGeneration {
  endpoint: CreativeCategory;
  apiModel: string;
  input: Record<string, unknown>;
}

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

export function resolveGeneration(
  model: CreativeModel,
  prompt: string,
  imageUrl?: string,
  audioUrl?: string,
  instrumental = false,
): ResolvedGeneration {
  const hasImage = Boolean(imageUrl);
  const images = hasImage ? [imageUrl!] : undefined;

  switch (model.id) {
    case "seedance-2.0":
      return {
        endpoint: "video",
        apiModel: "doubao-seedance-2.0",
        input: {
          prompt,
          duration: 5,
          aspect_ratio: "16:9",
          resolution: "720p",
          generate_audio: true,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "seedance-2.0-fast":
      return {
        endpoint: "video",
        apiModel: "doubao-seedance-2.0-fast",
        input: {
          prompt,
          duration: 5,
          aspect_ratio: "16:9",
          resolution: "720p",
          generate_audio: true,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "veo-3.1":
      return {
        endpoint: "video",
        apiModel: "veo-3",
        input: {
          prompt,
          mode: "fast",
          resolution: "720p",
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images, generation_type: "FIRST_AND_LAST_FRAMES_2_VIDEO" } : {}),
        },
      };

    case "sora-2":
      return {
        endpoint: "video",
        apiModel: "sora-2",
        input: {
          prompt,
          duration: 8,
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "kling-3.0":
      return {
        endpoint: "video",
        apiModel: "kling-3.0",
        input: {
          prompt,
          mode: "std",
          aspect_ratio: "16:9",
          duration: 5,
          sound: true,
          multi_shots: false,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "kling-2.6":
      if (!imageUrl) {
        throw new Error("Kling 2.6 requires a product image. Enable “Use product image” or pick another model.");
      }
      return {
        endpoint: "video",
        apiModel: "kling-2.6",
        input: {
          prompt,
          image_urls: [imageUrl],
          duration: 5,
          sound: true,
        },
      };

    case "happyhorse-1.1":
      return {
        endpoint: "video",
        apiModel: hasImage ? "happyhorse-1.1-image-to-video" : "happyhorse-1.1-text-to-video",
        input: {
          prompt,
          aspect_ratio: "16:9",
          resolution: "720p",
          duration: 5,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "happyhorse-1.0":
      return {
        endpoint: "video",
        apiModel: hasImage ? "happyhorse-1.0-image-to-video" : "happyhorse-1.0-text-to-video",
        input: {
          prompt,
          aspect_ratio: "16:9",
          resolution: "720p",
          duration: 5,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "wan-2.7":
      return {
        endpoint: "video",
        apiModel: "wan-2.7",
        input: {
          prompt,
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "wan-2.6":
      return {
        endpoint: "video",
        apiModel: "wan-2.6",
        input: {
          prompt,
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "grok-imagine":
      return {
        endpoint: "video",
        apiModel: hasImage ? "grok-imagine-image-to-video" : "grok-imagine-text-to-video",
        input: {
          prompt,
          aspect_ratio: "16:9",
          duration: 6,
          resolution: "720p",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "music-video-generator":
      if (!audioUrl) {
        throw new Error("Music video requires generated audio from the music step.");
      }
      if (!imageUrl) {
        throw new Error("Music video requires a reference image.");
      }
      return {
        endpoint: "video",
        apiModel: "music-video-generator",
        input: {
          audio_urls: [audioUrl],
          image_urls: [imageUrl],
          prompt,
          aspect_ratio: "16:9",
          resolution: "480p",
        },
      };

    case "gpt-image-2":
      return {
        endpoint: "image",
        apiModel: "gpt-image-2",
        input: {
          prompt,
          aspect_ratio: "16:9",
          resolution: "2k",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "nano-banana-2":
      return {
        endpoint: "image",
        apiModel: "nano-banana-2",
        input: {
          prompt,
          resolution: "2K",
          aspect_ratio: "16:9",
          output_format: "png",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "nano-banana":
      return {
        endpoint: "image",
        apiModel: "nano-banana",
        input: {
          prompt,
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "ideogram-v4":
      return {
        endpoint: "image",
        apiModel: "ideogram-v4",
        input: {
          prompt,
          aspect_ratio: "16:9",
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "seedream-5.0":
      return {
        endpoint: "image",
        apiModel: "seedream-5.0",
        input: {
          prompt,
          ...(images ? { image_urls: images } : {}),
        },
      };

    case "suno-v5.5":
      return {
        endpoint: "music",
        apiModel: "suno-v5_5",
        input: {
          prompt: prompt.slice(0, 500),
          custom_mode: false,
          instrumental,
        },
      };

    case "suno-v5":
      return {
        endpoint: "music",
        apiModel: "suno-v5",
        input: {
          prompt: prompt.slice(0, 500),
          custom_mode: false,
          instrumental,
        },
      };

    default:
      throw new Error(`Unsupported model: ${model.id}`);
  }
}
