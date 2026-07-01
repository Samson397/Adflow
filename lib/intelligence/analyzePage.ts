import type { PageDetails } from "@/lib/extract/types";
import type { ImageStrategy, PageIntelligence, SiteType } from "./types";

const ECOMMERCE_HINTS =
  /\b(shop|store|product|cart|buy|price|sku|collection|merch|ecommerce|e-commerce)\b/i;
const SAAS_HINTS =
  /\b(saas|software|app|platform|dashboard|api|cloud|tool|startup|subscription|free trial)\b/i;
const RESTAURANT_HINTS =
  /\b(restaurant|cafe|coffee|menu|food|dining|bakery|bar|bistro|kitchen|cuisine)\b/i;
const BLOG_HINTS =
  /\b(blog|article|news|post|magazine|editorial|journal|story|read more)\b/i;
const PORTFOLIO_HINTS =
  /\b(portfolio|agency|studio|creative|design|photography|freelance|works)\b/i;
const LOCAL_HINTS =
  /\b(dentist|clinic|lawyer|salon|spa|plumber|repair|local|appointment|book now)\b/i;

function scoreHints(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches?.length ?? 0;
}

export function classifySiteType(page: PageDetails): SiteType {
  const blob = [
    page.url,
    page.title,
    page.description,
    page.siteName ?? "",
    page.ctaText ?? "",
  ].join(" ");

  const scores: Record<SiteType, number> = {
    ecommerce: scoreHints(blob, ECOMMERCE_HINTS) + (page.price ? 3 : 0),
    saas: scoreHints(blob, SAAS_HINTS),
    restaurant: scoreHints(blob, RESTAURANT_HINTS),
    blog: scoreHints(blob, BLOG_HINTS),
    portfolio: scoreHints(blob, PORTFOLIO_HINTS),
    local_business: scoreHints(blob, LOCAL_HINTS),
    service: 0,
    general: 0,
  };

  const ranked = Object.entries(scores)
    .filter(([key]) => key !== "general" && key !== "service")
    .sort((a, b) => b[1] - a[1]);

  const [top, score] = ranked[0] ?? ["general", 0];
  if (score === 0) return "general";
  return top as SiteType;
}

const SITE_LABELS: Record<SiteType, string> = {
  ecommerce: "E-commerce / Product",
  saas: "SaaS / Software",
  local_business: "Local business",
  restaurant: "Restaurant / Food",
  blog: "Blog / Content",
  portfolio: "Portfolio / Agency",
  service: "Professional services",
  general: "General website",
};

function pickImageStrategy(
  siteType: SiteType,
  imageCount: number,
): { strategy: ImageStrategy; reason: string; needsGenerated: boolean } {
  if (imageCount >= 2) {
    return {
      strategy: "use_scraped",
      reason: "This page has enough images — we'll use them for video and ads.",
      needsGenerated: false,
    };
  }

  if (imageCount === 1) {
    return {
      strategy: "use_scraped",
      reason: "One image found — we'll use it, and can generate extra variants if needed.",
      needsGenerated: false,
    };
  }

  const strategyByType: Record<SiteType, ImageStrategy> = {
    ecommerce: "generate_product",
    saas: "generate_ui_mockup",
    local_business: "generate_lifestyle",
    restaurant: "generate_lifestyle",
    blog: "generate_hero",
    portfolio: "generate_hero",
    service: "generate_lifestyle",
    general: "generate_hero",
  };

  const strategy = strategyByType[siteType];
  const reasons: Record<ImageStrategy, string> = {
    use_scraped: "",
    generate_hero: "No images on this page — we'll generate an editorial hero image from your copy.",
    generate_product: "No product photos found — we'll generate a studio product shot for ads and video.",
    generate_lifestyle: "No photos found — we'll generate a lifestyle scene that fits this business.",
    generate_ui_mockup: "No screenshots found — we'll generate a SaaS-style product mockup for marketing.",
  };

  return {
    strategy,
    reason: reasons[strategy],
    needsGenerated: true,
  };
}

function buildImagePrompt(page: PageDetails, siteType: SiteType, strategy: ImageStrategy): string {
  const brand = page.siteName ?? page.title;
  const base = page.description.slice(0, 200);

  switch (strategy) {
    case "generate_product":
      return `Professional e-commerce product photo for "${page.title}" by ${brand}. ${base}. Clean white studio background, soft commercial lighting, high detail, ad-ready 16:9 composition.`;
    case "generate_ui_mockup":
      return `Modern SaaS marketing visual for "${page.title}". ${base}. Laptop and phone showing a polished app UI, gradient background, professional tech brand style, 16:9 hero image.`;
    case "generate_lifestyle":
      return `Warm lifestyle marketing photo for "${page.title}" (${brand}). ${base}. Inviting real-world scene, natural light, trustworthy local business feel, 16:9.`;
    case "generate_hero":
      if (siteType === "blog") {
        return `Editorial blog hero illustration for "${page.title}". ${base}. Conceptual, modern, readable at thumbnail size, 16:9.`;
      }
      return `Premium marketing hero image for "${page.title}" by ${brand}. ${base}. Bold, clean, social-ad ready, 16:9.`;
    default:
      return `Marketing image for "${page.title}". ${base}. Professional ad creative, 16:9.`;
  }
}

function buildVideoPrompt(page: PageDetails, siteType: SiteType): string {
  const cta = page.ctaText ?? "Learn more";
  switch (siteType) {
    case "ecommerce":
      return `Short product ad for ${page.title}. Slow camera push-in, premium lighting, subtle motion, CTA mood: ${cta}. 5 seconds, cinematic.`;
    case "saas":
      return `SaaS promo clip for ${page.title}. UI highlights, smooth camera movement, modern tech feel, trustworthy and clean. 5 seconds.`;
    case "restaurant":
      return `Appetizing food video for ${page.title}. Steam, close-up details, warm restaurant ambiance. 5 seconds.`;
    case "local_business":
    case "service":
      return `Trust-building video for ${page.title}. Welcoming scene, professional service vibe, soft camera motion. 5 seconds.`;
    default:
      return `Social ad video for ${page.title}. ${page.description.slice(0, 120)}. Dynamic but clean, 5 seconds, 16:9.`;
  }
}

function buildMusicPrompt(page: PageDetails, siteType: SiteType): string {
  switch (siteType) {
    case "ecommerce":
      return `Upbeat modern pop instrumental for a product ad about ${page.title}, energetic but not overwhelming`;
    case "saas":
      return `Clean corporate tech background music for ${page.title}, confident and modern`;
    case "restaurant":
      return `Warm acoustic background music for a food brand, inviting and relaxed`;
    case "blog":
      return `Light ambient background track for content about ${page.title}`;
    default:
      return `Professional background music for a brand video about ${page.title}`;
  }
}

export function analyzePage(page: PageDetails): PageIntelligence {
  const siteType = classifySiteType(page);
  const imageCount = page.images.length;
  const { strategy, reason, needsGenerated } = pickImageStrategy(siteType, imageCount);

  const imagePrompt = buildImagePrompt(page, siteType, strategy);
  const videoPrompt = buildVideoPrompt(page, siteType);
  const musicPrompt = buildMusicPrompt(page, siteType);

  const summary = needsGenerated
    ? `Detected a ${SITE_LABELS[siteType].toLowerCase()} site with no usable images. Fuse will generate creatives tailored to this page type.`
    : `Detected a ${SITE_LABELS[siteType].toLowerCase()} site with ${imageCount} image${imageCount === 1 ? "" : "s"}. We'll build on what we found.`;

  return {
    siteType,
    siteTypeLabel: SITE_LABELS[siteType],
    imageCount,
    imageStrategy: strategy,
    imageStrategyReason: reason,
    needsGeneratedImage: needsGenerated,
    recommendedImageModel: siteType === "ecommerce" ? "gpt-image-2" : "nano-banana-2",
    recommendedVideoModel: needsGenerated ? "seedance-2.0-fast" : "seedance-2.0",
    recommendedMusicModel: "suno-v5",
    imagePrompt,
    videoPrompt,
    musicPrompt,
    summary,
  };
}
