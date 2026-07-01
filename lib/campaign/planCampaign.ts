import { getModelById } from "@/lib/aivideoapi/models";
import { analyzePage } from "@/lib/intelligence/analyzePage";
import type { PageDetails } from "@/lib/extract/types";
import {
  buildPortraitImagePrompt,
  buildVocalMusicPrompt,
  parseCreativeIntent,
} from "@/lib/planner/parseIntent";
import type { CampaignPlan, CampaignStep } from "./types";

function stepId(kind: string, index: number): string {
  return `${kind}-${index}`;
}

function modelLabel(modelId: string): string {
  if (modelId === "ads") return "OpenAI / templates";
  return getModelById(modelId)?.label ?? modelId;
}

function makeStep(
  partial: Omit<CampaignStep, "modelLabel" | "status" | "id"> & {
    id?: string;
    status?: CampaignStep["status"];
  },
  index: number,
): CampaignStep {
  return {
    ...partial,
    id: partial.id ?? stepId(partial.kind, index),
    modelLabel: modelLabel(partial.modelId),
    status: partial.status ?? "pending",
  };
}

function needsImageStep(page: PageDetails, intelligence: ReturnType<typeof analyzePage>): boolean {
  return intelligence.needsGeneratedImage;
}

export function buildCampaignPlan(
  page: PageDetails,
  brief = "",
): CampaignPlan {
  const intelligence = analyzePage(page);
  const parsed = parseCreativeIntent(brief, page);
  const steps: CampaignStep[] = [];
  let index = 0;
  const trimmedBrief = brief.trim();
  const hasImage = page.images.length > 0;

  switch (parsed.intent) {
    case "singing_music_video": {
      if (!hasImage) {
        steps.push(
          makeStep(
            {
              kind: "generate_image",
              label: "Your photo",
              description: "Portrait for lip-sync (or use your uploaded photo URL)",
              category: "image",
              modelId: "nano-banana-2",
              prompt: buildPortraitImagePrompt(trimmedBrief),
              useImage: false,
            },
            index++,
          ),
        );
      }

      steps.push(
        makeStep(
          {
            kind: "generate_music",
            label: "Your song",
            description: "Suno generates vocals + melody from your brief",
            category: "music",
            modelId: "suno-v5.5",
            prompt: buildVocalMusicPrompt(trimmedBrief, page),
            useImage: false,
            instrumental: false,
          },
          index++,
        ),
      );

      steps.push(
        makeStep(
          {
            kind: "generate_music_video",
            label: "Singing music video",
            description: "Music Video Generator lip-syncs your photo to the song",
            category: "video",
            modelId: "music-video-generator",
            prompt: trimmedBrief || `Music video of ${page.title} singing`,
            useImage: true,
          },
          index++,
        ),
      );
      break;
    }

    case "music_video": {
      if (!hasImage) {
        steps.push(
          makeStep(
            {
              kind: "generate_image",
              label: "Reference image",
              description: "Subject image for the music video",
              category: "image",
              modelId: intelligence.recommendedImageModel,
              prompt: intelligence.imagePrompt,
              useImage: false,
            },
            index++,
          ),
        );
      }

      steps.push(
        makeStep(
          {
            kind: "generate_music",
            label: parsed.wantsVocals ? "Song with vocals" : "Background track",
            description: parsed.wantsVocals
              ? "Suno creates a vocal track"
              : "Suno creates instrumental music",
            category: "music",
            modelId: parsed.wantsVocals ? "suno-v5.5" : intelligence.recommendedMusicModel,
            prompt: trimmedBrief || intelligence.musicPrompt,
            useImage: false,
            instrumental: !parsed.wantsVocals,
          },
          index++,
        ),
      );

      steps.push(
        makeStep(
          {
            kind: "generate_music_video",
            label: "Music video",
            description: "Lip-sync video from audio + reference photo",
            category: "video",
            modelId: "music-video-generator",
            prompt: trimmedBrief || `Music video for ${page.title}`,
            useImage: true,
          },
          index++,
        ),
      );
      break;
    }

    case "image_only": {
      steps.push(
        makeStep(
          {
            kind: "generate_image",
            label: "Generate image",
            description: hasImage
              ? "Uses your reference as style guide"
              : "Creates image from your brief",
            category: "image",
            modelId: intelligence.recommendedImageModel,
            prompt: trimmedBrief || intelligence.imagePrompt,
            useImage: hasImage,
          },
          index++,
        ),
      );
      break;
    }

    case "music_only": {
      steps.push(
        makeStep(
          {
            kind: "generate_music",
            label: parsed.wantsVocals ? "Vocal track" : "Background music",
            description: parsed.wantsVocals
              ? "Suno with singing vocals"
              : "Suno instrumental track",
            category: "music",
            modelId: parsed.wantsVocals ? "suno-v5.5" : intelligence.recommendedMusicModel,
            prompt: trimmedBrief || intelligence.musicPrompt,
            useImage: false,
            instrumental: !parsed.wantsVocals,
          },
          index++,
        ),
      );
      break;
    }

    case "video_only": {
      if (needsImageStep(page, intelligence)) {
        steps.push(
          makeStep(
            {
              kind: "generate_image",
              label: "Hero image",
              description: intelligence.imageStrategyReason,
              category: "image",
              modelId: intelligence.recommendedImageModel,
              prompt: intelligence.imagePrompt,
              useImage: false,
            },
            index++,
          ),
        );
      }

      steps.push(
        makeStep(
          {
            kind: "generate_video",
            label: "Generate video",
            description: hasImage || intelligence.needsGeneratedImage
              ? "Uses reference image"
              : "Text-to-video from your brief",
            category: "video",
            modelId: intelligence.recommendedVideoModel,
            prompt: trimmedBrief || intelligence.videoPrompt,
            useImage: hasImage || intelligence.needsGeneratedImage,
          },
          index++,
        ),
      );
      break;
    }

    case "ads_only": {
      steps.push(
        makeStep(
          {
            kind: "generate_ads",
            label: "Generate ad copy",
            description: "Meta and Google text variants",
            category: "ads",
            modelId: "ads",
            prompt: "",
            useImage: hasImage,
          },
          index++,
        ),
      );
      break;
    }

    case "full_campaign":
    default: {
      if (intelligence.needsGeneratedImage) {
        steps.push(
          makeStep(
            {
              kind: "generate_image",
              label: "Generate hero image",
              description: intelligence.imageStrategyReason,
              category: "image",
              modelId: intelligence.recommendedImageModel,
              prompt: intelligence.imagePrompt,
              useImage: false,
            },
            index++,
          ),
        );
      }

      steps.push(
        makeStep(
          {
            kind: "generate_video",
            label: "Generate video ad",
            description: intelligence.needsGeneratedImage
              ? "Uses the generated image as reference"
              : "Uses your page image as reference",
            category: "video",
            modelId: intelligence.recommendedVideoModel,
            prompt: trimmedBrief || intelligence.videoPrompt,
            useImage: true,
          },
          index++,
        ),
      );

      steps.push(
        makeStep(
          {
            kind: "generate_music",
            label: "Generate background music",
            description: "Suno instrumental matched to your site",
            category: "music",
            modelId: intelligence.recommendedMusicModel,
            prompt: trimmedBrief || intelligence.musicPrompt,
            useImage: false,
            instrumental: true,
          },
          index++,
        ),
      );

      if (
        trimmedBrief.toLowerCase().includes("music video") ||
        trimmedBrief.toLowerCase().includes("lip sync")
      ) {
        steps.push(
          makeStep(
            {
              kind: "generate_music_video",
              label: "Generate music video",
              description: "Lip-sync from audio + reference photo",
              category: "video",
              modelId: "music-video-generator",
              prompt: trimmedBrief || `Music video for ${page.title}`,
              useImage: true,
            },
            index++,
          ),
        );
      }

      if (parsed.includeAds) {
        steps.push(
          makeStep(
            {
              kind: "generate_ads",
              label: "Generate ad copy",
              description: "Meta and Google text variants",
              category: "ads",
              modelId: "ads",
              prompt: "",
              useImage: true,
            },
            index++,
          ),
        );
      }
      break;
    }
  }

  return {
    id: `campaign-${Date.now()}`,
    brief,
    intent: parsed.intent,
    intentLabel: parsed.label,
    intentSummary: parsed.summary,
    requirements: parsed.requirements,
    intelligence,
    steps,
    createdAt: new Date().toISOString(),
  };
}
