export type SiteType =
  | "ecommerce"
  | "saas"
  | "local_business"
  | "restaurant"
  | "blog"
  | "portfolio"
  | "service"
  | "general";

export type ImageStrategy =
  | "use_scraped"
  | "generate_hero"
  | "generate_product"
  | "generate_lifestyle"
  | "generate_ui_mockup";

export interface PageIntelligence {
  siteType: SiteType;
  siteTypeLabel: string;
  imageCount: number;
  imageStrategy: ImageStrategy;
  imageStrategyReason: string;
  needsGeneratedImage: boolean;
  recommendedImageModel: string;
  recommendedVideoModel: string;
  recommendedMusicModel: string;
  imagePrompt: string;
  videoPrompt: string;
  musicPrompt: string;
  summary: string;
}
