"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CampaignPlanner } from "@/components/CampaignPlanner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import type { CampaignPlan } from "@/lib/campaign/types";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { loadPageDetailsOrBlank, savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";

function CampaignContent({ pageDetails: initial }: { pageDetails: PageDetails }) {
  const [pageDetails, setPageDetails] = useState(initial);
  const [plan, setPlan] = useState<CampaignPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageDetails: initial,
        brief: initial.description || undefined,
      }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (!cancelled && result.success) setPlan(result.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (loading || !plan) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Building your campaign plan…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader step="Fuse campaign" backHref="/" />
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Fuse your campaign</h1>
            <p className="mt-1 text-sm text-zinc-500">
              AI-planned image, video, music, and ad copy — adapted to this website.
            </p>
          </div>
          <Link href="/studio">
            <Button variant="secondary" className="w-full shrink-0 sm:w-auto">
              Manual studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <CampaignPlanner
          pageDetails={pageDetails}
          initialPlan={plan}
          onPageDetailsChange={setPageDetails}
        />
      </section>
    </main>
  );
}

export default function CampaignPage() {
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const stored = loadPageDetailsOrBlank();
  savePageDetails(stored);

  return <CampaignContent pageDetails={stored} />;
}
