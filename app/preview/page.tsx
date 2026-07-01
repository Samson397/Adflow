"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageDetailsCard } from "@/components/PageDetailsCard";
import { PageInsightBanner } from "@/components/PageInsightBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { analyzePage } from "@/lib/intelligence/analyzePage";
import { loadPageDetails, savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";

function PreviewContent({ initial }: { initial: PageDetails }) {
  const router = useRouter();
  const [details, setDetails] = useState(initial);
  const intelligence = useMemo(() => analyzePage(details), [details]);

  function handleContinueCampaign() {
    savePageDetails(details);
    router.push("/campaign");
  }

  function handleContinueStudio() {
    savePageDetails(details);
    router.push("/studio");
  }

  function handleContinueAds() {
    savePageDetails(details);
    router.push("/ads");
  }

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <Card>
        <div className="mb-6">
          <h1 className="text-xl font-semibold sm:text-2xl">Review extracted details</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Edit anything before generating videos, images, music, or ad copy.
          </p>
        </div>
        <PageInsightBanner intelligence={intelligence} />
        <PageDetailsCard details={details} onChange={setDetails} />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleContinueAds}
            className="w-full sm:w-auto"
          >
            Ad copy only
          </Button>
          <Button
            variant="secondary"
            onClick={handleContinueStudio}
            className="w-full sm:w-auto"
          >
            Manual studio
          </Button>
          <Button onClick={handleContinueCampaign} className="w-full sm:w-auto">
            Fuse campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </section>
  );
}

export default function PreviewPage() {
  const router = useRouter();
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const stored = loadPageDetails();
  if (!stored) {
    router.replace("/");
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader step="Step 1 · Review details" backHref="/" />
      <PreviewContent initial={stored} />
    </main>
  );
}
