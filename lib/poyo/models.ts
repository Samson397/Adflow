import type { CreativeModel } from "./types";

export const CREATIVE_MODELS: CreativeModel[] = [
  // Video
  {
    id: "seedance-2",
    label: "Seedance 2.0",
    category: "video",
    apiModel: "seedance-2",
    description: "Cinematic video with native audio and multi-shot support",
  },
  {
    id: "seedance-2-fast",
    label: "Seedance 2.0 Fast",
    category: "video",
    apiModel: "seedance-2-fast",
    description: "Faster Seedance drafts for quick iteration",
  },
  {
    id: "veo3.1-fast",
    label: "Veo 3.1",
    category: "video",
    apiModel: "veo3.1-fast",
    description: "Google Veo 3.1 fast 8-second video generation",
  },
  {
    id: "sora-2-official",
    label: "Sora 2",
    category: "video",
    apiModel: "sora-2-official",
    description: "OpenAI Sora 2 text and image-to-video",
  },
  {
    id: "kling-3.0-standard",
    label: "Kling 3.0",
    category: "video",
    apiModel: "kling-3.0/standard",
    description: "Kling 3.0 HD video with native audio",
  },
  {
    id: "kling-2.6",
    label: "Kling 2.6",
    category: "video",
    apiModel: "kling-2.6",
    description: "Kling 2.6 with synchronized speech and sound effects",
  },
  {
    id: "happy-horse-1-1",
    label: "HappyHorse 1.1",
    category: "video",
    apiModel: "happy-horse-1-1",
    description: "Alibaba Happy Horse reference and image-to-video",
  },
  {
    id: "happy-horse",
    label: "HappyHorse 1.0",
    category: "video",
    apiModel: "happy-horse",
    description: "Happy Horse text, image, and reference-to-video",
  },
  {
    id: "wan-2-7-video",
    label: "WAN 2.7",
    category: "video",
    apiModel: "wan-2-7-video",
    description: "Alibaba Wan 2.7 video generation",
  },
  {
    id: "wan-2-6",
    label: "WAN 2.6",
    category: "video",
    apiModel: "wan-2-6",
    description: "Multi-shot 1080p Wan 2.6 video",
  },
  {
    id: "grok-imagine",
    label: "Grok Imagine",
    category: "video",
    apiModel: "grok-imagine",
    description: "xAI Grok Imagine video generation",
  },
  // Image
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    category: "image",
    apiModel: "gpt-image-2",
    description: "OpenAI GPT Image 2 product and ad creatives",
  },
  {
    id: "nano-banana-2-new",
    label: "Nano Banana 2",
    category: "image",
    apiModel: "nano-banana-2-new",
    description: "Gemini 3.1 Flash image generation with 2K/4K",
  },
  {
    id: "nano-banana",
    label: "Nano Banana",
    category: "image",
    apiModel: "nano-banana",
    description: "Fast Gemini 2.5 Flash image generation",
  },
  {
    id: "seedream-5-0-lite",
    label: "Seedream 5.0",
    category: "image",
    apiModel: "seedream-5-0-lite",
    description: "ByteDance Seedream 5.0 Lite image generation",
  },
  // Music (Suno via PoYo generate-music)
  {
    id: "suno-v5-5",
    label: "Suno V5.5",
    category: "music",
    apiModel: "generate-music",
    musicVersion: "V5_5",
    description: "Suno V5.5 personalized music generation",
  },
  {
    id: "suno-v5",
    label: "Suno V5",
    category: "music",
    apiModel: "generate-music",
    musicVersion: "V5",
    description: "Suno V5 fast expressive music",
  },
];

export function getModelById(id: string): CreativeModel | undefined {
  return CREATIVE_MODELS.find((m) => m.id === id);
}

export function getModelsByCategory(category: CreativeModel["category"]): CreativeModel[] {
  return CREATIVE_MODELS.filter((m) => m.category === category);
}
