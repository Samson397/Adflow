import type { CreativeModel } from "./types";

export const CREATIVE_MODELS: CreativeModel[] = [
  {
    id: "seedance-2.0",
    label: "Seedance 2.0",
    category: "video",
    description: "Multi-modal video with text, image, video, and audio references",
  },
  {
    id: "seedance-2.0-fast",
    label: "Seedance 2.0 Fast",
    category: "video",
    description: "Faster, lower-cost Seedance 2.0 drafts",
  },
  {
    id: "veo-3.1",
    label: "Veo 3.1",
    category: "video",
    description: "Google Veo 3.1 with background music",
  },
  {
    id: "sora-2",
    label: "Sora 2",
    category: "video",
    description: "OpenAI Sora 2 text and image-to-video",
  },
  {
    id: "kling-3.0",
    label: "Kling 3.0",
    category: "video",
    description: "Kling 3.0 with native audio, 3–15 second clips",
  },
  {
    id: "kling-2.6",
    label: "Kling 2.6",
    category: "video",
    description: "Image-to-video with optional audio (requires product image)",
  },
  {
    id: "happyhorse-1.1",
    label: "HappyHorse 1.1",
    category: "video",
    description: "Alibaba HappyHorse text and image-to-video",
  },
  {
    id: "happyhorse-1.0",
    label: "HappyHorse 1.0",
    category: "video",
    description: "HappyHorse 1.0 text and image-to-video",
  },
  {
    id: "wan-2.7",
    label: "WAN 2.7",
    category: "video",
    description: "Alibaba Wan 2.7 with synced audio",
  },
  {
    id: "wan-2.6",
    label: "WAN 2.6",
    category: "video",
    description: "Alibaba Wan 2.6 multi-shot video",
  },
  {
    id: "grok-imagine",
    label: "Grok Imagine",
    category: "video",
    description: "xAI Grok Imagine text and image-to-video",
  },
  {
    id: "music-video-generator",
    label: "Music Video Generator",
    category: "video",
    description: "Lip-sync music video from audio + reference photos",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    category: "image",
    description: "OpenAI GPT Image 2 ad creatives",
  },
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    category: "image",
    description: "Gemini 3.1 Flash with 4K output",
  },
  {
    id: "nano-banana",
    label: "Nano Banana",
    category: "image",
    description: "Fast Gemini Flash image generation",
  },
  {
    id: "ideogram-v4",
    label: "Ideogram V4",
    category: "image",
    description: "Accurate text rendering for logos and posters",
  },
  {
    id: "seedream-5.0",
    label: "Seedream 5.0",
    category: "image",
    description: "ByteDance Seedream 5.0 image generation",
  },
  {
    id: "suno-v5.5",
    label: "Suno V5.5",
    category: "music",
    description: "Suno V5.5 personalized music",
  },
  {
    id: "suno-v5",
    label: "Suno V5",
    category: "music",
    description: "Suno V5 fast expressive music",
  },
];

export function getModelById(id: string): CreativeModel | undefined {
  return CREATIVE_MODELS.find((m) => m.id === id);
}

export function getModelsByCategory(category: CreativeModel["category"]): CreativeModel[] {
  return CREATIVE_MODELS.filter((m) => m.category === category);
}
