"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CreativeStudio } from "@/components/CreativeStudio";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { loadPageDetails } from "@/lib/storage";

export default function StudioPage() {
  const router = useRouter();
  const mounted = useClientMounted();

  if (!mounted) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const pageDetails = loadPageDetails();
  if (!pageDetails) {
    router.replace("/");
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-500">Redirecting…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader step="Step 2 · Create" backHref="/preview" />
      <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Card className="mb-6 p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">Creative studio</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Generate videos, images, and music with your AI models — powered by PoYo.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push("/ads")}
              className="w-full shrink-0 sm:w-auto"
            >
              Ad copy only
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <CreativeStudio pageDetails={pageDetails} />
        </Card>
      </section>
    </main>
  );
}
