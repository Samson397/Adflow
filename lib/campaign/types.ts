import type { CreativeCategory } from "@/lib/aivideoapi/types";
import type { PageIntelligence } from "@/lib/intelligence/types";
import type { CreativeIntent, PlanRequirement } from "@/lib/planner/types";

export type CampaignStepKind =
  | "generate_image"
  | "generate_video"
  | "generate_music"
  | "generate_music_video"
  | "generate_ads";

export type CampaignStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export interface CampaignStep {
  id: string;
  kind: CampaignStepKind;
  label: string;
  description: string;
  category: CreativeCategory | "ads";
  modelId: string;
  modelLabel: string;
  prompt: string;
  useImage: boolean;
  instrumental?: boolean;
  status: CampaignStepStatus;
  taskId?: string;
  outputUrls?: string[];
  errorMessage?: string;
}

export interface CampaignPlan {
  id: string;
  brief: string;
  intent: CreativeIntent;
  intentLabel: string;
  intentSummary: string;
  requirements: PlanRequirement[];
  intelligence: PageIntelligence;
  steps: CampaignStep[];
  createdAt: string;
}
