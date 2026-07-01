"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Sparkles,
  PenLine,
  ImageIcon,
  Film,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  createBlankPageDetails,
  createPageDetailsFromBrief,
  createPageDetailsFromImageUrl,
} from "@/lib/pageDetails/factory";
import { savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";

type Tab = "url" | "describe" | "image";

export function HomeLauncher() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [url, setUrl] = useState("");
  const [brief, setBrief] = useState("");
  const [brandName, setBrandName] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [refImageUrl, setRefImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const trimmed = url.trim();
      if (!trimmed) throw new Error("Please enter a URL");

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to analyze URL");
      }
      savePageDetails(result.data as PageDetails);
      router.push("/preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startFromDetails(details: PageDetails, destination: "/preview" | "/campaign" | "/studio" | "/ads") {
    savePageDetails(details);
    router.push(destination);
  }

  function handleDescribe(destination: "/preview" | "/campaign" | "/studio" | "/ads") {
    setError(null);
    if (!brief.trim()) {
      setError("Describe what you want to create");
      return;
    }
    const details = createPageDetailsFromBrief({
      brief,
      title: title || undefined,
      brandName: brandName || undefined,
      imageUrl: refImageUrl || undefined,
    });
    startFromDetails(details, destination);
  }

  function handleImageStart(destination: "/campaign" | "/studio") {
    setError(null);
    if (!imageUrl.trim()) {
      setError("Paste an image URL");
      return;
    }
    try {
      new URL(imageUrl.trim());
    } catch {
      setError("Enter a valid image URL");
      return;
    }
    const details = createPageDetailsFromImageUrl(imageUrl, imageCaption);
    startFromDetails(details, destination);
  }

  function openStudioBlank() {
    savePageDetails(createBlankPageDetails());
    router.push("/studio");
  }

  const tabs: { id: Tab; label: string; icon: typeof Link2 }[] = [
    { id: "url", label: "URL", icon: Link2 },
    { id: "describe", label: "Describe", icon: PenLine },
    { id: "image", label: "Image", icon: ImageIcon },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">What do you want to fuse?</h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Start from a URL, a description, a reference image — or jump straight into the studio.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); setError(null); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        {tab === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <p className="text-sm text-zinc-500">
              Paste a product or landing page — we extract details and adapt creatives to the site.
            </p>
            <Input
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Analyze URL"
              )}
            </Button>
          </form>
        )}

        {tab === "describe" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              No URL needed — describe your product, brand, or campaign and we plan the rest.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">What are you creating?</label>
              <Textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="e.g. A premium skincare serum for women 30+, clean aesthetic, launch video for Instagram..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Title (optional)</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Glow Serum" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Brand (optional)</label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Lumière" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reference image URL (optional)</label>
              <Input
                type="url"
                value={refImageUrl}
                onChange={(e) => setRefImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="flex-1" onClick={() => handleDescribe("/campaign")}>
                <Sparkles className="mr-2 h-4 w-4" />
                Fuse campaign
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => handleDescribe("/preview")}>
                Preview first
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => handleDescribe("/studio")}>
                Studio
              </Button>
            </div>
          </div>
        )}

        {tab === "image" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              Start from an existing image URL — great for image-to-video and edits.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Image URL</label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Caption (optional)</label>
              <Input
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Product hero shot"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="flex-1" onClick={() => handleImageStart("/campaign")}>
                Fuse campaign
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => handleImageStart("/studio")}>
                Open studio
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={openStudioBlank}
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
        >
          <Film className="mb-2 h-5 w-5 text-blue-600" />
          <p className="font-medium">Creative studio</p>
          <p className="mt-1 text-xs text-zinc-500">Pick any video, image, or music model</p>
        </button>
        <button
          type="button"
          onClick={() => {
            savePageDetails(createBlankPageDetails());
            router.push("/campaign");
          }}
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
        >
          <Sparkles className="mb-2 h-5 w-5 text-blue-600" />
          <p className="font-medium">Fuse campaign</p>
          <p className="mt-1 text-xs text-zinc-500">Full pipeline without a URL</p>
        </button>
        <button
          type="button"
          onClick={() => {
            savePageDetails(createBlankPageDetails());
            router.push("/ads");
          }}
          className="rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
        >
          <Megaphone className="mb-2 h-5 w-5 text-blue-600" />
          <p className="font-medium">Ad copy</p>
          <p className="mt-1 text-xs text-zinc-500">Meta & Google text only</p>
        </button>
      </div>
    </div>
  );
}
