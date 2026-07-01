"use client";

import { cn } from "@/lib/utils/cn";
import type { AdVariant } from "@/lib/ads/types";
import { GOOGLE_LIMITS } from "@/lib/ads/platforms/google";
import { META_LIMITS } from "@/lib/ads/platforms/meta";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AdVariantEditorProps {
  variant: AdVariant;
  onChange: (variant: AdVariant) => void;
}

function CharCounter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span
      className={cn(
        "text-xs",
        over ? "font-medium text-red-600" : "text-zinc-400",
      )}
    >
      {value.length}/{max}
    </span>
  );
}

export function AdVariantEditor({ variant, onChange }: AdVariantEditorProps) {
  function update<K extends keyof AdVariant>(key: K, value: AdVariant[K]) {
    onChange({ ...variant, [key]: value });
  }

  if (variant.format === "google_responsive_search") {
    return (
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Headlines</label>
          </div>
          {(variant.headlines ?? [variant.headline]).map((headline, index) => (
            <div key={index} className="mb-2">
              <div className="mb-1 flex justify-end">
                <CharCounter value={headline} max={GOOGLE_LIMITS.headline} />
              </div>
              <Input
                value={headline}
                onChange={(e) => {
                  const headlines = [...(variant.headlines ?? [variant.headline])];
                  headlines[index] = e.target.value;
                  update("headlines", headlines);
                  update("headline", headlines[0] ?? "");
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Descriptions</label>
          {(variant.descriptions ?? [variant.primaryText]).map((desc, index) => (
            <div key={index} className="mb-2">
              <div className="mb-1 flex justify-end">
                <CharCounter value={desc} max={GOOGLE_LIMITS.description} />
              </div>
              <Textarea
                value={desc}
                onChange={(e) => {
                  const descriptions = [
                    ...(variant.descriptions ?? [variant.primaryText]),
                  ];
                  descriptions[index] = e.target.value;
                  update("descriptions", descriptions);
                  update("primaryText", descriptions[0] ?? "");
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium">Headline</label>
          <CharCounter
            value={variant.headline}
            max={
              variant.platform === "meta"
                ? META_LIMITS.headline
                : GOOGLE_LIMITS.headline
            }
          />
        </div>
        <Input
          value={variant.headline}
          onChange={(e) => update("headline", e.target.value)}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium">
            {variant.platform === "meta" ? "Primary text" : "Description"}
          </label>
          <CharCounter
            value={variant.primaryText}
            max={
              variant.platform === "meta"
                ? META_LIMITS.primaryText
                : GOOGLE_LIMITS.description
            }
          />
        </div>
        <Textarea
          value={variant.primaryText}
          onChange={(e) => update("primaryText", e.target.value)}
        />
      </div>
      {variant.platform === "meta" && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">Link description</label>
            <CharCounter
              value={variant.description ?? ""}
              max={META_LIMITS.linkDescription}
            />
          </div>
          <Input
            value={variant.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">CTA</label>
        <Input
          value={variant.cta ?? ""}
          onChange={(e) => update("cta", e.target.value)}
        />
      </div>
    </div>
  );
}
