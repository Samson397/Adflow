import { z } from "zod";

export const pageDetailsSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  description: z.string(),
  images: z.array(z.string().url()),
  favicon: z.string().url().optional(),
  siteName: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  ctaText: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  language: z.string().optional(),
});

export type PageDetails = z.infer<typeof pageDetailsSchema>;
