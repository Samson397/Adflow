"use client";

import { useCallback, useState } from "react";
import {
  Film,
  ImageIcon,
  Loader2,
  Music,
  Sparkles,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { buildPromptFromPage } from "@/lib/aivideoapi/buildInput";
import { getModelsByCategory } from "@/lib/aivideoapi/models";
import type { CreativeCategory, GenerationJob, OutputFile } from "@/lib/aivideoapi/types";
import type { PageDetails } from "@/lib/extract/types";
import { loadCreativeJobs, saveCreativeJobs } from "@/lib/storage";

const TABS: { id: CreativeCategory; label: string; icon: typeof Film }[] = [
  { id: "video", label: "Video", icon: Film },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "music", label: "Music", icon: Music },
];

function fileUrl(file: OutputFile): string | undefined {
  return file.url;
}

function ResultPreview({ job }: { job: GenerationJob }) {
  const url = job.files.map(fileUrl).find(Boolean);

  if (job.status === "failed") {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{job.errorMessage ?? "Generation failed"}</span>
      </div>
    );
  }

  if (!url) {
    return (
      <p className="text-sm text-zinc-500">
        {job.status === "pending" || job.status === "processing"
          ? "Generating…"
          : "No output files yet"}
      </p>
    );
  }

  if (job.category === "video") {
    return (
      <video
        src={url}
        controls
        playsInline
        className="w-full rounded-lg bg-black"
      />
    );
  }

  if (job.category === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={job.prompt} className="w-full rounded-lg object-cover" />
    );
  }

  return (
    <div className="space-y-2">
      {job.files[0]?.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={job.files[0].image_url}
          alt={job.files[0].title ?? "Cover"}
          className="h-32 w-32 rounded-lg object-cover"
        />
      )}
      <audio src={url} controls className="w-full" />
      {job.files[0]?.title && (
        <p className="text-sm font-medium">{job.files[0].title}</p>
      )}
    </div>
  );
}

export function CreativeStudio({ pageDetails }: { pageDetails: PageDetails }) {
  const [tab, setTab] = useState<CreativeCategory>("video");
  const models = getModelsByCategory(tab);
  const [modelId, setModelId] = useState(() => getModelsByCategory("video")[0]?.id ?? "");
  const [prompt, setPrompt] = useState(() => buildPromptFromPage(pageDetails));
  const [useProductImage, setUseProductImage] = useState(
    pageDetails.images.length > 0,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>(() => loadCreativeJobs());

  function selectTab(id: CreativeCategory) {
    setTab(id);
    const nextModels = getModelsByCategory(id);
    setModelId(nextModels[0]?.id ?? "");
  }

  const pollJob = useCallback(async (job: GenerationJob) => {
    const terminal = new Set<GenerationJob["status"]>(["completed", "failed"]);
    let current = job;

    while (!terminal.has(current.status)) {
      await new Promise((r) => setTimeout(r, 3000));

      const response = await fetch(
        `/api/generate/status/${current.taskId}?category=${current.category}&modelId=${current.modelId}`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        current = {
          ...current,
          status: "failed",
          errorMessage: result.error ?? "Status check failed",
        };
        break;
      }

      current = {
        ...current,
        status: result.data.status,
        files: result.data.files ?? [],
        errorMessage: result.data.errorMessage,
      };

      setJobs((prev) => {
        const next = prev.map((j) => (j.taskId === current.taskId ? current : j));
        saveCreativeJobs(next);
        return next;
      });
    }

    setJobs((prev) => {
      const next = prev.map((j) => (j.taskId === current.taskId ? current : j));
      saveCreativeJobs(next);
      return next;
    });

    return current;
  }, []);

  async function handleGenerate() {
    setError(null);
    setSubmitting(true);

    try {
      const model = models.find((m) => m.id === modelId);
      if (!model) throw new Error("Select a model");

      const imageUrl =
        useProductImage && pageDetails.images[0]
          ? pageDetails.images[0]
          : undefined;

      const response = await fetch("/api/generate/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, prompt, imageUrl }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to start generation");
      }

      const job: GenerationJob = {
        taskId: result.data.taskId,
        modelId: model.id,
        modelLabel: model.label,
        category: model.category,
        prompt,
        status: result.data.status,
        files: [],
        createdAt: new Date().toISOString(),
      };

      const nextJobs = [job, ...jobs];
      setJobs(nextJobs);
      saveCreativeJobs(nextJobs);
      await pollJob(job);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedModel = models.find((m) => m.id === modelId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Model</label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {selectedModel && (
            <p className="mt-1.5 text-xs text-zinc-500">{selectedModel.description}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe the video, image, or music you want…"
          />
        </div>

        {pageDetails.images[0] && tab !== "music" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useProductImage}
              onChange={(e) => setUseProductImage(e.target.checked)}
              className="rounded"
            />
            Use product image from URL as reference
          </label>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={submitting || !prompt.trim()}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate {tab}
            </>
          )}
        </Button>
      </Card>

      {jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your creations</h2>
          {jobs.map((job) => {
            const downloadUrl = job.files.map(fileUrl).find(Boolean);
            return (
              <Card key={job.taskId} className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{job.modelLabel}</p>
                    <p className="text-xs text-zinc-500 capitalize">
                      {job.category} · {job.status.replace("_", " ")}
                    </p>
                  </div>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button type="button" variant="secondary" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </a>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {job.prompt}
                </p>
                <ResultPreview job={job} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
