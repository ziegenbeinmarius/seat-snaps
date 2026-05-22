import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16 text-center overflow-hidden">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-[12%] left-[8%] h-72 w-72 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }} data-parallax="-0.08" />
        <div className="absolute top-[30%] right-[5%] h-96 w-96 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }} data-parallax="-0.12" />
        <div className="absolute bottom-[10%] left-[15%] h-48 w-48 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #D4A87A 0%, transparent 70%)" }} data-parallax="-0.05" />

        {/* Subtle dot pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.03]">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#8C8C8C" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div data-animate="fade-up" className="landing-animate">
        <div className="landing-mascot-float mb-6">
          <Image
            src="/images/koala-mascot.png"
            alt="SeatSnaps Koala mascot with a retro camera"
            width={240}
            height={411}
            priority
          />
        </div>
      </div>

      <h1
        data-animate="fade-up"
        className="landing-animate landing-delay-1 max-w-lg text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 18%)" }}
      >
        Your event, captured beautifully
      </h1>

      <p data-animate="fade-up" className="landing-animate landing-delay-2 mt-4 max-w-md text-lg" style={{ color: "hsl(28 8% 45%)" }}>
        Seating plans, photo sharing, and a guest directory — all in one place.
      </p>

      <div data-animate="fade-up" className="landing-animate landing-delay-3 mt-8 flex items-center gap-4">
        <Button size="lg" className="landing-btn-glow" asChild>
          <Link href="/register">Create Your Event</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>

      {/* Scroll hint */}
      <div className="landing-animate landing-delay-4 absolute bottom-8 landing-scroll-hint" data-animate="fade-up">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(28 8% 60%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
