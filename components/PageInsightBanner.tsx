"use client";

import type { PageIntelligence } from "@/lib/intelligence/types";
import { Sparkles, ImageOff } from "lucide-react";

export function PageInsightBanner({ intelligence }: { intelligence: PageIntelligence }) {
  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          {intelligence.needsGeneratedImage ? (
            <ImageOff className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{intelligence.siteTypeLabel}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{intelligence.summary}</p>
          <p className="text-xs text-zinc-500">{intelligence.imageStrategyReason}</p>
        </div>
      </div>
    </div>
  );
}
