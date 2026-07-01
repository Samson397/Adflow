export type CreativeIntent =
  | "singing_music_video"
  | "music_video"
  | "full_campaign"
  | "video_only"
  | "image_only"
  | "music_only"
  | "ads_only";

export type PlanRequirementKind = "person_photo" | "reference_image";

export interface PlanRequirement {
  id: string;
  kind: PlanRequirementKind;
  label: string;
  description: string;
  satisfied: boolean;
}

export interface ParsedIntent {
  intent: CreativeIntent;
  label: string;
  summary: string;
  requirements: PlanRequirement[];
  wantsVocals: boolean;
  includeAds: boolean;
}
