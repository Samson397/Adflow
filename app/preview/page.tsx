"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageDetailsCard } from "@/components/PageDetailsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClientMounted } from "@/lib/hooks/use-client-mounted";
import { loadPageDetails, savePageDetails } from "@/lib/storage";
import type { PageDetails } from "@/lib/extract/types";

function PreviewContent({ initial }: { initial: PageDetails }) {
  const router = useRouter();
  const [details, setDetails] = useState(initial);

  function handleContinue() {
    savePageDetails(details);
    router.push("/ads");
  }

  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Review extracted details</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Edit anything before we generate your ad copy.
          </p>
        </div>
        <PageDetailsCard details={details} onChange={setDetails} />
        <div className="mt-8 flex justify-end">
          <Button onClick={handleContinue}>
            Create ads
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
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold">
            Adflow
          </Link>
          <span className="text-sm text-zinc-500">Step 1 · Review details</span>
        </div>
      </header>
      <PreviewContent initial={stored} />
    </main>
  );
}
