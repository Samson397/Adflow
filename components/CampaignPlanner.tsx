"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Play,
  Download,
  AlertCircle,
  Sparkles,
  Brain,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [photoUrl, setPhotoUrl] = useState(pageDetails.images[0] ?? "");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsatisfiedRequirements = useMemo(
    () => plan.requirements.filter((r) => !r.satisfied),
    [plan.requirements],
  );

  const canRun =
    unsatisfiedRequirements.length === 0 ||
    (unsatisfiedRequirements.every((r) => r.kind === "person_photo" || r.kind === "reference_image") &&
      photoUrl.trim().length > 0);

  const refreshPlan = useCallback(async () => {
    const workingPage =
      photoUrl.trim() && !pageDetails.images.includes(photoUrl.trim())
        ? { ...pageDetails, images: [photoUrl.trim(), ...pageDetails.images] }
        : pageDetails;

    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageDetails: workingPage, brief }),
    });
    const result = await response.json();
    if (result.success) setPlan(result.data);
  }, [pageDetails, brief, photoUrl]);

  function applyPhotoUrl() {
    const url = photoUrl.trim();
    if (!url) return;
    const updated = { ...pageDetails, images: [url, ...pageDetails.images.filter((i) => i !== url)] };
    onPageDetailsChange(updated);
    savePageDetails(updated);
    void refreshPlan();
  }

  async function runCampaign() {
    setError(null);
    setRunning(true);

    let workingPage = { ...pageDetails };
    if (photoUrl.trim()) {
      workingPage = {
        ...workingPage,
        images: [photoUrl.trim(), ...workingPage.images.filter((i) => i !== photoUrl.trim())],
      };
      onPageDetailsChange(workingPage);
      savePageDetails(workingPage);
    }

    let imageUrl = workingPage.images[0];
    let audioUrl: string | undefined;

    try {
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];

        if (
          step.useImage &&
          !imageUrl &&
          (step.kind === "generate_music_video" || step.kind === "generate_video")
        ) {
          throw new Error("This step needs a reference photo — paste your image URL above.");
        }

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
          instrumental: step.instrumental ?? true,
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
      <Card className="border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:p-6">
        <div className="flex gap-3">
          <Brain className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">{plan.intentLabel}</p>
            <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/80">{plan.intentSummary}</p>
          </div>
        </div>
      </Card>

      {unsatisfiedRequirements.length > 0 && (
        <Card className="space-y-4 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20 sm:p-6">
          <div className="flex gap-3">
            <Camera className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">Before we start</p>
                {unsatisfiedRequirements.map((req) => (
                  <p key={req.id} className="mt-1 text-sm text-amber-800/90 dark:text-amber-200/80">
                    {req.description}
                  </p>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="url"
                  placeholder="https://… your photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  disabled={running}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyPhotoUrl}
                  disabled={running || !photoUrl.trim()}
                  className="shrink-0"
                >
                  Use this photo
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <PageInsightBanner intelligence={plan.intelligence} />

      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">What you want</label>
          <Textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder='e.g. "A video of me singing an upbeat pop song"'
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Fuse picks the right AI models and steps — you don&apos;t choose Video vs Music manually.
          </p>
        </div>
        <Button variant="secondary" onClick={refreshPlan} disabled={running} type="button">
          Update plan
        </Button>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Your plan</h2>
        <ol className="space-y-4">
          {plan.steps.map((step, stepIndex) => (
            <li key={step.id} className="flex gap-3">
              <div className="mt-0.5 flex flex-col items-center gap-1">
                {stepIcon(step.status)}
                <span className="text-[10px] font-medium text-zinc-400">{stepIndex + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{step.label}</p>
                <p className="text-sm text-zinc-500">{step.description}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  AI: <span className="font-medium text-zinc-600 dark:text-zinc-300">{step.modelLabel}</span>
                  {step.kind === "generate_music" && (
                    <span>
                      {" "}
                      · {step.instrumental === false ? "with vocals" : "instrumental"}
                    </span>
                  )}
                </p>
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
          disabled={running || !canRun}
        >
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run plan
            </>
          )}
        </Button>
        {!canRun && !running && (
          <p className="mt-2 text-xs text-amber-600">Add your photo URL above to continue.</p>
        )}
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
