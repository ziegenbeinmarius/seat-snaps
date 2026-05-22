import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
      <Image
        src="/images/koala-mascot.svg"
        alt="SeatSnaps Koala mascot sitting on an event table with a retro camera"
        width={280}
        height={310}
        priority
        className="mb-8"
      />

      <h1
        className="max-w-lg text-5xl font-semibold leading-tight tracking-tight sm:text-6xl"
        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 18%)" }}
      >
        Your event, captured beautifully
      </h1>

      <p className="mt-4 max-w-md text-lg" style={{ color: "hsl(28 8% 45%)" }}>
        Seating plans, photo sharing, and a guest directory — all in one place.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Button size="lg" asChild>
          <Link href="/register">Create Your Event</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </section>
  );
}
