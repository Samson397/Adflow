import type { AdVariant } from "@/lib/ads/types";
import type { PageDetails } from "@/lib/extract/types";
import type { GenerationJob } from "@/lib/aivideoapi/types";

const PAGE_DETAILS_KEY = "fuse:pageDetails";
const AD_VARIANTS_KEY = "fuse:adVariants";
const SELECTION_KEY = "fuse:selection";
const CREATIVE_JOBS_KEY = "fuse:creativeJobs";

export interface AdSelection {
  platforms: ("meta" | "google")[];
  formats: (
    | "meta_single_image"
    | "meta_carousel"
    | "google_responsive_search"
    | "google_display"
  )[];
}

export function savePageDetails(details: PageDetails): void {
  sessionStorage.setItem(PAGE_DETAILS_KEY, JSON.stringify(details));
}

export function loadPageDetails(): PageDetails | null {
  const raw = sessionStorage.getItem(PAGE_DETAILS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PageDetails;
  } catch {
    return null;
  }
}

export function saveSelection(selection: AdSelection): void {
  sessionStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
}

export function loadSelection(): AdSelection | null {
  const raw = sessionStorage.getItem(SELECTION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdSelection;
  } catch {
    return null;
  }
}

export function saveAdVariants(variants: AdVariant[]): void {
  sessionStorage.setItem(AD_VARIANTS_KEY, JSON.stringify(variants));
}

export function loadAdVariants(): AdVariant[] | null {
  const raw = sessionStorage.getItem(AD_VARIANTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdVariant[];
  } catch {
    return null;
  }
}

export function saveCreativeJobs(jobs: GenerationJob[]): void {
  sessionStorage.setItem(CREATIVE_JOBS_KEY, JSON.stringify(jobs));
}

export function loadCreativeJobs(): GenerationJob[] {
  const raw = sessionStorage.getItem(CREATIVE_JOBS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GenerationJob[];
  } catch {
    return [];
  }
}

export function clearFuseSession(): void {
  sessionStorage.removeItem(PAGE_DETAILS_KEY);
  sessionStorage.removeItem(AD_VARIANTS_KEY);
  sessionStorage.removeItem(SELECTION_KEY);
  sessionStorage.removeItem(CREATIVE_JOBS_KEY);
}
