import * as cheerio from "cheerio";
import type { PageDetails } from "./types";

function absoluteUrl(base: string, value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    return new URL(value, base).href;
  } catch {
    return undefined;
  }
}

function metaContent(
  $: cheerio.CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const selector of selectors) {
    const value = $(selector).attr("content")?.trim();
    if (value) return value;
  }
  return undefined;
}

function parseJsonLdProduct($: cheerio.CheerioAPI): {
  price?: string;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
} {
  const result: {
    price?: string;
    currency?: string;
    name?: string;
    description?: string;
    image?: string;
  } = {};

  $('script[type="application/ld+json"]').each((_, el) => {
    if (result.price) return;
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(data) ? data : [data];

      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const record = node as Record<string, unknown>;
        const type = record["@type"];
        const types = Array.isArray(type) ? type : [type];

        if (!types.some((t) => t === "Product" || t === "ProductGroup")) continue;

        if (typeof record.name === "string" && !result.name) {
          result.name = record.name;
        }
        if (typeof record.description === "string" && !result.description) {
          result.description = record.description;
        }
        if (typeof record.image === "string") {
          result.image = record.image;
        } else if (Array.isArray(record.image) && typeof record.image[0] === "string") {
          result.image = record.image[0];
        }

        const offers = record.offers;
        const offer = Array.isArray(offers) ? offers[0] : offers;
        if (offer && typeof offer === "object") {
          const offerRecord = offer as Record<string, unknown>;
          if (offerRecord.price != null) {
            result.price = String(offerRecord.price);
          }
          if (typeof offerRecord.priceCurrency === "string") {
            result.currency = offerRecord.priceCurrency;
          }
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  });

  return result;
}

export function parseMetadata(html: string, pageUrl: string): PageDetails {
  const $ = cheerio.load(html);
  const product = parseJsonLdProduct($);

  const title =
    metaContent($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ??
    $("title").first().text().trim() ??
    product.name ??
    "";

  const description =
    metaContent($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]) ??
    product.description ??
    "";

  const imageCandidates = new Set<string>();
  const ogImage = metaContent($, [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
  ]);
  if (ogImage) {
    const abs = absoluteUrl(pageUrl, ogImage);
    if (abs) imageCandidates.add(abs);
  }
  if (product.image) {
    const abs = absoluteUrl(pageUrl, product.image);
    if (abs) imageCandidates.add(abs);
  }

  $('meta[property="og:image:url"]').each((_, el) => {
    const abs = absoluteUrl(pageUrl, $(el).attr("content"));
    if (abs) imageCandidates.add(abs);
  });

  const faviconHref =
    $('link[rel="icon"]').attr("href") ??
    $('link[rel="shortcut icon"]').attr("href") ??
    $('link[rel="apple-touch-icon"]').attr("href");

  const faviconAbs = absoluteUrl(pageUrl, faviconHref);
  const favicon =
    faviconAbs && !faviconAbs.startsWith("data:") ? faviconAbs : undefined;

  const siteName = metaContent($, ['meta[property="og:site_name"]']);
  const canonical = $('link[rel="canonical"]').attr("href");
  const language = $("html").attr("lang") ?? undefined;

  const price =
    product.price ??
    metaContent($, ['meta[property="product:price:amount"]']) ??
    undefined;
  const currency =
    product.currency ??
    metaContent($, ['meta[property="product:price:currency"]']) ??
    undefined;

  return {
    url: pageUrl,
    title: title.trim(),
    description: description.trim(),
    images: Array.from(imageCandidates),
    favicon,
    siteName: siteName?.trim() || undefined,
    price: price?.trim() || undefined,
    currency: currency?.trim() || undefined,
    ctaText: undefined,
    canonicalUrl: absoluteUrl(pageUrl, canonical),
    language,
  };
}
