"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { createPageDetailsFromBrief } from "@/lib/pageDetails/factory";
import { savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";
import { looksLikeUrl, normalizeUrlInput } from "@/lib/utils/normalizeUrl";

export function HomeLauncher() {
  const router = useRouter();
  const [siteInput, setSiteInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    const trimmedSite = siteInput.trim();
    const trimmedPrompt = prompt.trim();
    const trimmedPhoto = photoUrl.trim();

    if (!trimmedSite && !trimmedPrompt) {
      setError("Describe what you want — e.g. “A video of me singing”");
      return;
    }

    setLoading(true);

    try {
      let pageDetails: PageDetails;

      if (trimmedSite && looksLikeUrl(trimmedSite)) {
        const url = normalizeUrlInput(trimmedSite);
        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Could not read that URL");
        }
        pageDetails = result.data as PageDetails;
        if (trimmedPrompt) {
          pageDetails = {
            ...pageDetails,
            description: trimmedPrompt,
          };
        }
        if (trimmedPhoto) {
          pageDetails = {
            ...pageDetails,
            images: [trimmedPhoto, ...pageDetails.images],
          };
        }
      } else if (trimmedSite && !trimmedPrompt) {
        throw new Error("That doesn't look like a URL — try example.com/product");
      } else {
        pageDetails = createPageDetailsFromBrief({
          brief: trimmedPrompt,
          imageUrl: trimmedPhoto || undefined,
        });
      }

      savePageDetails(pageDetails);
      router.push("/campaign");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Say it. Fuse it.</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Tell us what you want — Fuse picks the right AI, models, and steps for you.
        </p>
      </div>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">What do you want to create?</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            disabled={loading}
            placeholder="e.g. A video of me singing an upbeat pop song…"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Your photo <span className="font-normal text-zinc-500">(if it&apos;s about you)</span>
          </label>
          <Input
            type="url"
            placeholder="https://… photo of you (for lip-sync / music videos)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Your site <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <Input
            type="text"
            placeholder="example.com/product"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            disabled={loading}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Add a URL for product campaigns — Fuse still plans from your prompt.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <Button type="button" className="w-full" disabled={loading} onClick={handleCreate}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Planning…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
