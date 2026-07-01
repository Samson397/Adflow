import Link from "next/link";
import { CreditsBadge } from "@/components/CreditsBadge";

export function SiteHeader({
  step,
  backHref = "/",
}: {
  step?: string;
  backHref?: string;
}) {
  return (
    <header className="border-b border-zinc-200 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] dark:border-zinc-800 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href={backHref} className="text-lg font-semibold tracking-tight">
          Fuse
        </Link>
        <div className="flex items-center gap-2">
          <CreditsBadge />
          {step && (
            <span className="text-right text-xs text-zinc-500 sm:text-sm">{step}</span>
          )}
        </div>
      </div>
    </header>
  );
}
