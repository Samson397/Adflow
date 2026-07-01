"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import {
  PlatformSelector,
  type PlatformSelection,
} from "@/components/PlatformSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import {
  loadPageDetails,
  loadSelection,
  saveAdVariants,
  saveSelection,
} from "@/lib/storage";

const defaultSelection: PlatformSelection = {
  platforms: ["meta", "google"],
  formats: ["meta_single_image", "google_responsive_search"],
};

function AdsContent({ initialSelection }: { initialSelection: PlatformSelection }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState(initialSelection);

  async function handleGenerate() {
    const pageDetails = loadPageDetails();
    if (!pageDetails) {
      router.replace("/");
      return;
    }

    if (selection.platforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (selection.formats.length === 0) {
      setError("Select at least one ad format");
      return;
    }

    setLoading(true);
    setError(null);
    saveSelection(selection);

    try {
      const response = await fetch("/api/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageDetails,
          platforms: selection.platforms,
          formats: selection.formats,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to generate ads");
      }

      saveAdVariants(result.data.variants);
      router.push("/editor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Choose platforms & formats</h1>
          <p className="mt-1 text-sm text-zinc-500">
            We&apos;ll generate editable ad variants for each selection.
          </p>
        </div>
        <PlatformSelector value={selection} onChange={setSelection} />
        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <div className="mt-8">
          <Button onClick={handleGenerate} disabled={loading} className="w-full sm:ml-auto sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                Generate ads
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </section>
  );
}

export default function AdsPage() {
  const router = useRouter();
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (!loadPageDetails()) {
    router.replace("/");
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Redirecting…</p>
      </main>
    );
  }

  const initialSelection = loadSelection() ?? defaultSelection;

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader step="Step 2 · Choose platforms" backHref="/preview" />
      <AdsContent initialSelection={initialSelection} />
    </main>
  );
}
