"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdVariantEditor } from "@/components/AdVariantEditor";
import { ExportPanel } from "@/components/ExportPanel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { loadAdVariants, saveAdVariants } from "@/lib/storage";
import type { AdVariant } from "@/lib/ads/types";

const platformLabels: Record<string, string> = {
  meta: "Meta",
  google: "Google",
};

function EditorContent({ initial }: { initial: AdVariant[] }) {
  const [variants, setVariants] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? "");

  const activeVariant =
    variants.find((v) => v.id === activeId) ?? variants[0];

  function updateVariant(updated: AdVariant) {
    const next = variants.map((v) => (v.id === updated.id ? updated : v));
    setVariants(next);
    saveAdVariants(next);
  }

  const grouped = {
    meta: variants.filter((v) => v.platform === "meta"),
    google: variants.filter((v) => v.platform === "google"),
  };

  return (
    <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your ad variants</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Edit copy inline. Red counters mean you&apos;re over the platform limit.
          </p>
        </div>
        <ExportPanel variants={variants} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {(["meta", "google"] as const).map((platform) => {
            const items = grouped[platform];
            if (!items.length) return null;
            return (
              <div key={platform}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {platformLabels[platform]}
                </p>
                <div className="space-y-2">
                  {items.map((variant, index) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setActiveId(variant.id)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        activeId === variant.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800",
                      )}
                    >
                      <span className="font-medium">Variant {index + 1}</span>
                      <p className="truncate text-xs text-zinc-500">
                        {variant.headline || variant.primaryText}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase dark:bg-zinc-800">
              {platformLabels[activeVariant.platform]}
            </span>
            <span className="text-xs text-zinc-500">
              {activeVariant.format.replace(/_/g, " ")}
            </span>
          </div>
          <AdVariantEditor variant={activeVariant} onChange={updateVariant} />
        </Card>
      </div>
    </section>
  );
}

export default function EditorPage() {
  const router = useRouter();
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const stored = loadAdVariants();
  if (!stored?.length) {
    router.replace("/");
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/ads" className="text-lg font-semibold">
            Adflow
          </Link>
          <span className="text-sm text-zinc-500">Step 3 · Review & export</span>
        </div>
      </header>
      <EditorContent initial={stored} />
    </main>
  );
}
