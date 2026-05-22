import Image from "next/image";

export function SceneSection() {
  return (
    <section className="relative overflow-hidden py-24" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(196,149,106,0.06) 30%, rgba(196,149,106,0.1) 50%, rgba(196,149,106,0.06) 70%, transparent 100%)" }}>
      {/* Decorative side dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-[20%] right-[3%] h-40 w-40 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }} data-parallax="-0.06" />
        <div className="absolute bottom-[15%] left-[5%] h-32 w-32 rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #D4A87A 0%, transparent 70%)" }} data-parallax="-0.1" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Parallax scene illustration */}
          <div className="relative w-full max-w-xl flex-shrink-0" data-animate="fade-right">
            <div className="landing-animate" data-parallax="-0.04">
              <Image
                src="/images/koala-scene.svg"
                alt="A group of koalas at an event table, one taking a photo of the others"
                width={900}
                height={420}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Copy */}
          <div className="text-center lg:text-left" data-animate="fade-left">
            <h2
              className="landing-animate text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 18%)" }}
            >
              Every moment, every guest
            </h2>
            <p className="landing-animate landing-delay-1 mt-4 max-w-sm text-base leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
              From the first snap to the last dance, SeatSnaps brings your event together — seating charts your guests love, a shared photo gallery everyone contributes to, and a directory to stay connected long after.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
