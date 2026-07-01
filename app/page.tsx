import { HomeLauncher } from "@/components/HomeLauncher";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <HomeLauncher />
      </section>
    </main>
  );
}
