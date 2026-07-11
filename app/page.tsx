import { Loader } from "@/components/loader";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import {
  CtaSection,
  Footer,
  HowSection,
  ModelsSection,
  PrivacySection,
} from "@/components/sections";
import { ParticleField } from "@/components/particle-field";
import { cookies } from "next/headers";

export default async function Home() {
  const skip =
    (await cookies()).get("aiu_locale")?.value === "es"
      ? "Saltar al contenido"
      : "Skip to content";
  return (
    <Loader>
      <ParticleField />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {skip}
      </a>
      <Nav />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <PrivacySection />
        <ModelsSection />
        <HowSection />
        <CtaSection />
      </main>
      <Footer />
    </Loader>
  );
}
