"use client";

import { useCallback, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  Download,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageInsightBanner } from "@/components/PageInsightBanner";
import type { CampaignPlan, CampaignStep } from "@/lib/campaign/types";
import { pollTaskUntilDone, submitGeneration } from "@/lib/campaign/runStep";
import type { PageDetails } from "@/lib/extract/types";
import { saveAdVariants, savePageDetails } from "@/lib/storage";

interface CampaignPlannerProps {
  pageDetails: PageDetails;
  initialPlan: CampaignPlan;
  onPageDetailsChange: (details: PageDetails) => void;
}

function stepIcon(status: CampaignStep["status"]) {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (status === "running") return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
  if (status === "failed") return <AlertCircle className="h-5 w-5 text-red-600" />;
  return <Circle className="h-5 w-5 text-zinc-300" />;
}

export function CampaignPlanner({
  pageDetails,
  initialPlan,
  onPageDetailsChange,
}: CampaignPlannerProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [brief, setBrief] = useState(initialPlan.brief);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPlan = useCallback(async () => {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageDetails, brief }),
    });
    const result = await response.json();
    if (result.success) setPlan(result.data);
  }, [pageDetails, brief]);

  async function runCampaign() {
    setError(null);
    setRunning(true);

    let workingPage = { ...pageDetails };
    let imageUrl = workingPage.images[0];
    let audioUrl: string | undefined;

    try {
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];

        setPlan((prev) => ({
          ...prev,
          steps: prev.steps.map((s, idx) =>
            idx === i ? { ...s, status: "running" } : s,
          ),
        }));

        if (step.kind === "generate_ads") {
          const response = await fetch("/api/ads/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pageDetails: workingPage,
              platforms: ["meta", "google"],
              formats: ["meta_single_image", "google_responsive_search"],
            }),
          });
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error ?? "Ad generation failed");
          }
          saveAdVariants(result.data.variants);
          setPlan((prev) => ({
            ...prev,
            steps: prev.steps.map((s, idx) =>
              idx === i ? { ...s, status: "completed" } : s,
            ),
          }));
          continue;
        }

        const taskId = await submitGeneration({
          modelId: step.modelId,
          prompt: step.prompt,
          imageUrl: step.useImage ? imageUrl : undefined,
          audioUrl: step.kind === "generate_music_video" ? audioUrl : undefined,
          instrumental: step.kind === "generate_music",
        });

        const result = await pollTaskUntilDone(
          taskId,
          step.category as "video" | "image" | "music",
          step.modelId,
        );

        if (result.status === "failed") {
          throw new Error(result.errorMessage ?? `${step.label} failed`);
        }

        const urls = result.files.map((f) => f.url).filter(Boolean);

        if (step.kind === "generate_image" && urls[0]) {
          imageUrl = urls[0];
          workingPage = { ...workingPage, images: [urls[0], ...workingPage.images] };
          onPageDetailsChange(workingPage);
          savePageDetails(workingPage);
        }

        if (step.kind === "generate_music" && urls[0]) {
          audioUrl = urls[0];
        }

        setPlan((prev) => ({
          ...prev,
          steps: prev.steps.map((s, idx) =>
            idx === i
              ? { ...s, status: "completed", taskId, outputUrls: urls }
              : s,
          ),
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Campaign failed";
      setError(message);
      setPlan((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.status === "running" ? { ...s, status: "failed", errorMessage: message } : s,
        ),
      }));
    } finally {
      setRunning(false);
    }
  }

  const allOutputs = plan.steps.flatMap((s) => s.outputUrls ?? []);

  return (
    <div className="space-y-6">
      <PageInsightBanner intelligence={plan.intelligence} />

      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Campaign brief (optional)
          </label>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder='e.g. "Upbeat 5s product video with cinematic lighting" or "music video with lip sync"'
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Fuse adapts the plan to your site type
            {plan.intelligence.needsGeneratedImage ? " and generates images when the page has none" : ""}.
          </p>
        </div>
        <Button variant="secondary" onClick={refreshPlan} disabled={running} type="button">
          Update plan
        </Button>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Campaign plan</h2>
        <ol className="space-y-4">
          {plan.steps.map((step) => (
            <li key={step.id} className="flex gap-3">
              <div className="mt-0.5">{stepIcon(step.status)}</div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-zinc-500">{step.description}</p>
                {step.outputUrls && step.outputUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.outputUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline"
                      >
                        Download
                      </a>
                    ))}
                  </div>
                )}
                {step.errorMessage && (
                  <p className="mt-1 text-sm text-red-600">{step.errorMessage}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <Button
          className="mt-6 w-full sm:w-auto"
          onClick={runCampaign}
          disabled={running}
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running campaign…
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run full campaign
            </>
          )}
        </Button>
      </Card>

      {allOutputs.length > 0 && (
        <Card className="p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Export assets</h2>
          </div>
          <p className="mb-4 text-sm text-zinc-500">
            Download your generated files. Video and audio URLs expire after 24 hours.
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.steps
              .filter((s) => s.outputUrls?.length)
              .map((step) =>
                step.outputUrls!.map((url) => (
                  <a key={`${step.id}-${url}`} href={url} download target="_blank" rel="noopener noreferrer">
                    <Button type="button" variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {step.label}
                    </Button>
                  </a>
                )),
              )}
          </div>
        </Card>
      )}
    </div>
  );
}
