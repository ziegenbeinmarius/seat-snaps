import { auth } from "@/auth";
import { LandingShell } from "@/components/landing/landing-client";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { SceneSection } from "@/components/landing/scene-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SectionDivider } from "@/components/landing/section-divider";

export default async function HomePage() {
  let session: Awaited<ReturnType<typeof auth>> = null;
  try {
    session = await auth();
  } catch {
    // Not logged in or auth error — treat as guest
  }

  const isLoggedIn = !!session?.user;

  return (
    <main className="landing-bg">
      <LandingHeader isLoggedIn={isLoggedIn} />
      <LandingShell>
        <HeroSection user={session?.user ?? null} />
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
