import Link from "next/link";

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
        {step ? (
          <span className="text-right text-xs text-zinc-500 sm:text-sm">{step}</span>
        ) : (
          <span className="text-sm text-zinc-500">Say it. Fuse it.</span>
        )}
      </div>
    </header>
  );
}
