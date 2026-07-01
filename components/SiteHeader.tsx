import Link from "next/link";
import { CreditsBadge } from "@/components/CreditsBadge";

const NAV = [
  { href: "/studio", label: "Studio" },
  { href: "/campaign", label: "Campaign" },
  { href: "/ads", label: "Ads" },
];

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
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={backHref} className="text-lg font-semibold tracking-tight">
            Fuse
          </Link>
          <nav className="hidden items-center gap-3 sm:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {step ? (
          <div className="flex items-center gap-2">
            <CreditsBadge />
            <span className="text-right text-xs text-zinc-500 sm:text-sm">{step}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditsBadge />
            <span className="hidden text-sm text-zinc-500 sm:inline">Say it. Fuse it.</span>
          </div>
        )}
      </div>
    </header>
  );
}
