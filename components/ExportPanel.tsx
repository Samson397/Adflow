"use client";

import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AdVariant } from "@/lib/ads/types";
import { exportMetaVariant } from "@/lib/ads/platforms/meta";
import {
  exportGoogleDisplayVariant,
  exportGoogleSearchVariant,
} from "@/lib/ads/platforms/google";

interface ExportPanelProps {
  variants: AdVariant[];
}

function formatVariantForExport(variant: AdVariant) {
  if (variant.platform === "meta") {
    return exportMetaVariant(variant);
  }
  if (variant.format === "google_responsive_search") {
    return exportGoogleSearchVariant({
      headlines: variant.headlines ?? [variant.headline],
      descriptions: variant.descriptions ?? [variant.primaryText],
    });
  }
  return exportGoogleDisplayVariant({
    headline: variant.headline,
    description: variant.description ?? variant.primaryText,
    imageUrl: variant.imageUrl,
  });
}

export function ExportPanel({ variants }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const exportBundle = {
    exportedAt: new Date().toISOString(),
    variants: variants.map(formatVariantForExport),
  };

  async function copyAll() {
    await navigator.clipboard.writeText(JSON.stringify(exportBundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuse-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Button type="button" variant="secondary" onClick={copyAll} className="w-full sm:w-auto">
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </>
        )}
      </Button>
      <Button type="button" onClick={downloadJson} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" />
        Download bundle
      </Button>
    </div>
  );
}
