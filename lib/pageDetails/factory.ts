import type { PageDetails } from "@/lib/extract/types";

const FUSE_ORIGIN = "https://fuse.app";

export function createBlankPageDetails(): PageDetails {
  return {
    url: `${FUSE_ORIGIN}/project/${Date.now()}`,
    title: "Untitled project",
    description: "",
    images: [],
    ctaText: "Learn more",
  };
}

export function createPageDetailsFromBrief(input: {
  brief: string;
  title?: string;
  brandName?: string;
  imageUrl?: string;
  ctaText?: string;
}): PageDetails {
  const brief = input.brief.trim();
  return {
    url: `${FUSE_ORIGIN}/brief/${Date.now()}`,
    title: input.title?.trim() || brief.slice(0, 80) || "My campaign",
    description: brief,
    images: input.imageUrl?.trim() ? [input.imageUrl.trim()] : [],
    siteName: input.brandName?.trim() || undefined,
    ctaText: input.ctaText?.trim() || "Learn more",
  };
}

export function createPageDetailsFromImageUrl(imageUrl: string, caption?: string): PageDetails {
  return {
    url: `${FUSE_ORIGIN}/image/${Date.now()}`,
    title: caption?.trim() || "Image project",
    description: caption?.trim() || "Creative project from reference image",
    images: [imageUrl.trim()],
    ctaText: "Learn more",
  };
}

export function isFromUrlExtract(page: PageDetails): boolean {
  try {
    const host = new URL(page.url).hostname;
    return host !== "fuse.app";
  } catch {
    return false;
  }
}
