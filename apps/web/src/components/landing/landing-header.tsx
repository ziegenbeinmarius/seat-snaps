import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(245, 237, 224, 0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(196, 149, 106, 0.1)" }}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/koala-logo.svg" alt="" width={32} height={32} className="landing-logo-bounce" />
          <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}>
            SeatSnaps
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
