"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Film,
  ImageIcon,
  Music,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { createPageDetailsFromBrief } from "@/lib/pageDetails/factory";
import { savePageDetails, saveStudioTab } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";
import { looksLikeUrl, normalizeUrlInput } from "@/lib/utils/normalizeUrl";

type CreateChoice = "all" | "video" | "image" | "music" | "ads";

const CHOICES: {
  id: CreateChoice;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "all", label: "Everything", icon: Sparkles },
  { id: "video", label: "Video", icon: Film },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
  { id: "ads", label: "Ad copy", icon: Megaphone },
];

export function HomeLauncher() {
  const router = useRouter();
  const [siteInput, setSiteInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [choice, setChoice] = useState<CreateChoice>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    const trimmedSite = siteInput.trim();
    const trimmedPrompt = prompt.trim();

    if (!trimmedSite && !trimmedPrompt) {
      setError("Paste your site URL or describe what you want to create");
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
      } else if (trimmedSite && !trimmedPrompt) {
        throw new Error("That doesn't look like a URL — try example.com/product");
      } else {
        pageDetails = createPageDetailsFromBrief({ brief: trimmedPrompt });
      }

      savePageDetails(pageDetails);

      switch (choice) {
        case "all":
          router.push("/campaign");
          break;
        case "video":
          saveStudioTab("video");
          router.push("/studio");
          break;
        case "image":
          saveStudioTab("image");
          router.push("/studio");
          break;
        case "music":
          saveStudioTab("music");
          router.push("/studio");
          break;
        case "ads":
          router.push("/ads");
          break;
      }
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
          Paste your site, say what you want — pick what to create.
        </p>
      </div>

      <Card className="space-y-5 p-4 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your site</label>
          <Input
            type="text"
            placeholder="example.com/product"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            disabled={loading}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <p className="mt-1 text-xs text-zinc-500">No need to type https://</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Prompt (optional)</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={loading}
            placeholder="e.g. 5 second product video with upbeat music for Instagram..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Create</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CHOICES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setChoice(id)}
                disabled={loading}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors sm:text-sm ${
                  choice === id
                    ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
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
              Working…
            </>
          ) : (
            "Create"
          )}
        </Button>
      </Card>
    </div>
  );
}
