import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingShell } from "@/components/landing/landing-client";
import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { SceneSection } from "@/components/landing/scene-section";
import { FeaturesSection } from "@/components/landing/features-section";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main style={{ background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)" }}>
      <LandingHeader />
      <LandingShell>
        <HeroSection />
        <SceneSection />
        <FeaturesSection />

        <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: "hsl(33 18% 86%)", color: "hsl(28 8% 52%)" }}>
          &copy; {new Date().getFullYear()} SeatSnaps. All rights reserved.
        </footer>
      </LandingShell>
    </main>
  );
}
