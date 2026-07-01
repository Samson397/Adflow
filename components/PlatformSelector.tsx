"use client";

import { cn } from "@/lib/utils/cn";
import type { AdFormat, Platform } from "@/lib/ads/types";
import { googleSpecs } from "@/lib/ads/platforms/google";
import { metaSpecs } from "@/lib/ads/platforms/meta";

export interface PlatformSelection {
  platforms: Platform[];
  formats: AdFormat[];
}

interface PlatformSelectorProps {
  value: PlatformSelection;
  onChange: (value: PlatformSelection) => void;
}

const platformOptions: { id: Platform; label: string; description: string }[] = [
  {
    id: "meta",
    label: "Meta",
    description: "Facebook & Instagram ads",
  },
  {
    id: "google",
    label: "Google Ads",
    description: "Search & display campaigns",
  },
];

const allFormats = [...metaSpecs, ...googleSpecs];

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  function togglePlatform(platform: Platform) {
    const platforms = value.platforms.includes(platform)
      ? value.platforms.filter((p) => p !== platform)
      : [...value.platforms, platform];

    const allowedFormats = allFormats
      .filter((f) => platforms.includes(f.platform))
      .map((f) => f.format);
    const formats = value.formats.filter((f) => allowedFormats.includes(f));

    onChange({ platforms, formats });
  }

  function toggleFormat(format: AdFormat) {
    const formats = value.formats.includes(format)
      ? value.formats.filter((f) => f !== format)
      : [...value.formats, format];
    onChange({ ...value, formats });
  }

  const visibleFormats = allFormats.filter((f) =>
    value.platforms.includes(f.platform),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-medium">Platforms</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {platformOptions.map((option) => {
            const selected = value.platforms.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => togglePlatform(option.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  selected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800",
                )}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-zinc-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {visibleFormats.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium">Ad formats</h3>
          <div className="space-y-2">
            {visibleFormats.map((spec) => {
              const selected = value.formats.includes(spec.format);
              return (
                <label
                  key={spec.format}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4",
                    selected
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                      : "border-zinc-200 dark:border-zinc-800",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFormat(spec.format)}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <div>
                    <p className="font-medium">{spec.label}</p>
                    <p className="text-xs text-zinc-500">
                      {spec.limits.map((l) => `${l.label}: ${l.max} chars`).join(" · ")}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
