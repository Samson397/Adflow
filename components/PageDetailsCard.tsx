"use client";

import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { PageDetails } from "@/lib/extract/types";

interface PageDetailsCardProps {
  details: PageDetails;
  onChange: (details: PageDetails) => void;
}

export function PageDetailsCard({ details, onChange }: PageDetailsCardProps) {
  const selectedImage = details.images[0];

  function update<K extends keyof PageDetails>(key: K, value: PageDetails[K]) {
    onChange({ ...details, [key]: value });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <Input
            value={details.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Textarea
            value={details.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Price</label>
            <Input
              value={details.price ?? ""}
              onChange={(e) => update("price", e.target.value || undefined)}
              placeholder="29.99"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Currency</label>
            <Input
              value={details.currency ?? ""}
              onChange={(e) => update("currency", e.target.value || undefined)}
              placeholder="USD"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">CTA text</label>
          <Input
            value={details.ctaText ?? ""}
            onChange={(e) => update("ctaText", e.target.value || undefined)}
            placeholder="Shop now"
          />
        </div>
        {details.images.length > 1 && (
          <div>
            <label className="mb-2 block text-sm font-medium">Primary image</label>
            <div className="grid grid-cols-3 gap-2">
              {details.images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...details,
                      images: [img, ...details.images.filter((i) => i !== img)],
                    })
                  }
                  className={`overflow-hidden rounded-lg border-2 ${
                    img === selectedImage
                      ? "border-blue-600"
                      : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Preview
        </p>
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
          {selectedImage ? (
            <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
              <Image
                src={selectedImage}
                alt={details.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-zinc-100 px-4 text-center text-sm text-zinc-500 dark:bg-zinc-900">
              <span>No image on this page</span>
              <span className="text-xs">Fuse will generate one based on your site type</span>
            </div>
          )}
          <div className="space-y-1 p-4">
            <p className="text-xs uppercase text-zinc-500">
              {details.siteName ?? new URL(details.url).hostname}
            </p>
            <h3 className="font-semibold">{details.title || "Untitled page"}</h3>
            <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
              {details.description || "No description extracted."}
            </p>
            {details.price && (
              <p className="text-sm font-medium text-blue-600">
                {details.currency ? `${details.currency} ` : ""}
                {details.price}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
