import { UrlInputForm } from "@/components/UrlInputForm";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">Adflow</span>
          <span className="text-sm text-zinc-500">URL → Multi-platform ads</span>
        </div>
      </header>
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <UrlInputForm />
      </section>
    </main>
  );
}
