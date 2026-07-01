import type { PageDetails } from "@/lib/extract/types";
import { isFromUrlExtract } from "@/lib/pageDetails/factory";
import type { ParsedIntent, PlanRequirement } from "./types";

const PERSON_RE =
  /\b(me|myself|my face|of me|i'm|i am|my photo|my picture|my portrait)\b/i;
const SINGING_RE =
  /\b(sing|singing|singer|vocals|karaoke|cover song|perform(?:ing)?|lip.?sync|lip sync)\b/i;
const MUSIC_VIDEO_RE = /\b(music video|mv\b|lip.?sync|lip sync)\b/i;
const SONG_RE = /\b(song|track|music|audio|beat|melody)\b/i;
const VIDEO_RE = /\b(video|reel|clip|commercial|promo|advert)\b/i;
const IMAGE_RE = /\b(image|photo|picture|poster|banner|thumbnail|logo|graphic)\b/i;
const ADS_RE = /\b(ad copy|ads only|meta ad|google ad|headlines?|ad text)\b/i;
const EVERYTHING_RE =
  /\b(everything|full campaign|all assets|complete campaign|fuse it all)\b/i;

function hasReferenceImage(page: PageDetails): boolean {
  return page.images.length > 0;
}

function buildPersonPhotoRequirement(page: PageDetails): PlanRequirement {
  const satisfied = hasReferenceImage(page);
  return {
    id: "person_photo",
    kind: "person_photo",
    label: "Photo of you",
    description: satisfied
      ? "Using your reference photo for the music video"
      : "Paste a clear photo URL of yourself — needed for lip-sync",
    satisfied,
  };
}

export function parseCreativeIntent(
  brief: string,
  page: PageDetails,
): ParsedIntent {
  const text = brief.trim();
  const lower = text.toLowerCase();
  const fromSite = isFromUrlExtract(page);
  const hasImage = hasReferenceImage(page);

  const personRef = PERSON_RE.test(text);
  const singing = SINGING_RE.test(text);
  const musicVideo = MUSIC_VIDEO_RE.test(text);
  const song = SONG_RE.test(text);
  const video = VIDEO_RE.test(text);
  const image = IMAGE_RE.test(text);
  const adsOnly = ADS_RE.test(text);
  const everything = EVERYTHING_RE.test(text);

  if (adsOnly && !video && !song && !image) {
    return {
      intent: "ads_only",
      label: "Ad copy",
      summary: "Generate Meta and Google ad text from your brief.",
      requirements: [],
      wantsVocals: false,
      includeAds: true,
    };
  }

  if ((personRef && singing) || (personRef && musicVideo) || (singing && musicVideo)) {
    return {
      intent: "singing_music_video",
      label: "Singing music video",
      summary:
        "We'll create a song with vocals (Suno), then a lip-sync music video (Music Video Generator). " +
        (hasImage ? "Your photo is ready." : "Add your photo first."),
      requirements: [buildPersonPhotoRequirement(page)],
      wantsVocals: true,
      includeAds: fromSite,
    };
  }

  if (musicVideo || (song && video && !image)) {
    return {
      intent: "music_video",
      label: "Music video",
      summary: hasImage
        ? "Song with Suno, then lip-sync video from your reference image."
        : "Generate a reference image, song with Suno, then lip-sync video.",
      requirements: hasImage
        ? []
        : [
            {
              id: "reference_image",
              kind: "reference_image",
              label: "Reference image",
              description: "Paste an image URL for the music video subject",
              satisfied: false,
            },
          ],
      wantsVocals: singing || lower.includes("vocal"),
      includeAds: fromSite,
    };
  }

  if (image && !video && !song) {
    return {
      intent: "image_only",
      label: "Image",
      summary: "Generate a single image from your brief.",
      requirements: [],
      wantsVocals: false,
      includeAds: false,
    };
  }

  if (song && !video && !image) {
    return {
      intent: "music_only",
      label: "Music",
      summary: singing
        ? "Generate a vocal track with Suno from your brief."
        : "Generate background music with Suno from your brief.",
      requirements: [],
      wantsVocals: singing || lower.includes("vocal") || lower.includes("lyrics"),
      includeAds: false,
    };
  }

  if (video && !song && !fromSite && !everything) {
    return {
      intent: "video_only",
      label: "Video",
      summary: hasImage
        ? "Generate a short video from your reference image."
        : "Generate a hero image, then a short video ad.",
      requirements: [],
      wantsVocals: false,
      includeAds: false,
    };
  }

  return {
    intent: "full_campaign",
    label: fromSite ? "Full campaign" : "Creative package",
    summary: fromSite
      ? "Hero image (if needed), product video, background music, and ad copy — tailored to your site."
      : "Image, video, music, and ad copy from your brief.",
    requirements: [],
    wantsVocals: false,
    includeAds: true,
  };
}

export function buildPortraitImagePrompt(brief: string): string {
  const base =
    "Professional portrait photo, person facing camera, neutral background, studio lighting, ready to perform";
  if (!brief.trim()) return base;
  return `${base}. Context: ${brief.trim()}`;
}

export function buildVocalMusicPrompt(brief: string, page: PageDetails): string {
  if (brief.trim()) {
    return `Vocal song: ${brief.trim()}. Catchy melody with clear singing vocals.`;
  }
  return `Vocal pop song for ${page.title}. Upbeat, emotional, radio-ready with lyrics.`;
}
