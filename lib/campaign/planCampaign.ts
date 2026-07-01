import { analyzePage } from "@/lib/intelligence/analyzePage";
import type { PageDetails } from "@/lib/extract/types";
import type { CampaignPlan, CampaignStep } from "./types";

function stepId(kind: string, index: number): string {
  return `${kind}-${index}`;
}

export function buildCampaignPlan(
  page: PageDetails,
  brief = "",
): CampaignPlan {
  const intelligence = analyzePage(page);
  const steps: CampaignStep[] = [];
  let index = 0;

  if (intelligence.needsGeneratedImage) {
    steps.push({
      id: stepId("image", index++),
      kind: "generate_image",
      label: "Generate hero image",
      description: intelligence.imageStrategyReason,
      category: "image",
      modelId: intelligence.recommendedImageModel,
      prompt: intelligence.imagePrompt,
      useImage: false,
      status: "pending",
    });
  }

  steps.push({
    id: stepId("video", index++),
    kind: "generate_video",
    label: "Generate video ad",
    description: intelligence.needsGeneratedImage
      ? "Uses the generated image as reference"
      : "Uses your page image as reference",
    category: "video",
    modelId: intelligence.recommendedVideoModel,
    prompt: brief.trim() || intelligence.videoPrompt,
    useImage: true,
    status: "pending",
  });

  steps.push({
    id: stepId("music", index++),
    kind: "generate_music",
    label: "Generate background music",
    description: "Suno track matched to your site type",
    category: "music",
    modelId: intelligence.recommendedMusicModel,
    prompt: brief.trim() || intelligence.musicPrompt,
    useImage: false,
    status: "pending",
  });

  if (brief.toLowerCase().includes("music video") || brief.toLowerCase().includes("lip sync")) {
    steps.push({
      id: stepId("mv", index++),
      kind: "generate_music_video",
      label: "Generate music video",
      description: "Lip-sync music video from audio + reference photo",
      category: "video",
      modelId: "music-video-generator",
      prompt: brief.trim() || `Music video for ${page.title}`,
      useImage: true,
      status: "pending",
    });
  }

  steps.push({
    id: stepId("ads", index++),
    kind: "generate_ads",
    label: "Generate ad copy",
    description: "Meta and Google text variants",
    category: "ads",
    modelId: "ads",
    prompt: "",
    useImage: true,
    status: "pending",
  });

  return {
    id: `campaign-${Date.now()}`,
    brief,
    intelligence,
    steps,
    createdAt: new Date().toISOString(),
  };
}
