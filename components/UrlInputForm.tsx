"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";

export function UrlInputForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmed = url.trim();
      if (!trimmed) {
        throw new Error("Please enter a URL");
      }

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

  return (
    <Card className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Link2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Paste your URL</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We&apos;ll extract your page details and help you create ads for Meta and Google.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="url"
          placeholder="https://example.com/product"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </form>
    </Card>
  );
}
