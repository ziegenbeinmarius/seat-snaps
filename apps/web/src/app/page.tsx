import { LandingShell } from "@/components/landing/landing-client";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { SceneSection } from "@/components/landing/scene-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SectionDivider } from "@/components/landing/section-divider";

export default function HomePage() {
  return (
    <main className="landing-bg">
      <LandingHeader />
      <LandingShell>
        <HeroSection />
        <SectionDivider variant="wave" />
        <SceneSection />
        <SectionDivider variant="scallop" />
        <FeaturesSection />
        <SectionDivider variant="leaf" />

        <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: "hsl(33 18% 86%)", color: "hsl(28 8% 52%)" }}>
          &copy; {new Date().getFullYear()} SeatSnaps. All rights reserved.
        </footer>
      </LandingShell>
    </main>
  );
}
