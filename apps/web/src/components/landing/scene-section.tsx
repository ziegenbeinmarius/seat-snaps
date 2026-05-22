import Image from "next/image";

export function SceneSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      {/* Decorative side blooms */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[16%] right-[3%] h-44 w-44 rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #C4956A 0%, transparent 70%)" }}
          data-parallax="-0.06"
        />
        <div
          className="absolute bottom-[12%] left-[5%] h-36 w-36 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #D4A87A 0%, transparent 70%)" }}
          data-parallax="-0.1"
        />
      </div>

      {/* Highlighted panel */}
      <div
        data-animate="fade-up"
        className="landing-animate relative mx-auto max-w-5xl rounded-[2rem] border px-7 py-12 sm:px-12 sm:py-16"
        style={{
          borderColor: "rgba(196, 149, 106, 0.3)",
          background:
            "linear-gradient(150deg, rgba(255,253,248,0.95) 0%, rgba(244,231,210,0.95) 100%)",
          boxShadow: "0 30px 70px -32px rgba(120, 85, 40, 0.4)",
        }}
      >
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-14">
          {/* Framed photo — tilted like a print, straightens on hover */}
          <div className="w-full max-w-md flex-shrink-0 lg:max-w-lg" data-parallax="-0.03">
            <div
              className="rotate-[-2.5deg] rounded-lg bg-white p-3 transition-transform duration-500 ease-out hover:rotate-0"
              style={{ boxShadow: "0 20px 45px -18px rgba(80, 55, 25, 0.5)" }}
            >
              <Image
                src="/images/koala-scene.jpg"
                alt="A group of Australian animals at an event table, a koala taking a photo of the others"
                width={1800}
                height={1004}
                className="h-auto w-full rounded-sm"
              />
              <p
                className="pt-3 pb-1 text-center text-base"
                style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(28 8% 48%)" }}
              >
                The whole gang, all in one shot
              </p>
            </div>
          </div>

          {/* Copy */}
          <div className="text-center lg:text-left">
            <span
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ background: "hsl(28 65% 44% / 0.12)", color: "hsl(28 60% 38%)" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "hsl(28 65% 44%)" }}
              />
              A peek inside
            </span>
            <h2
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 18%)" }}
            >
              Every moment, every guest
            </h2>
            <p
              className="mt-4 max-w-sm text-base leading-relaxed"
              style={{ color: "hsl(28 8% 45%)" }}
            >
              From the first snap to the last dance, SeatSnaps brings your event together — seating
              charts your guests love, a shared photo gallery everyone contributes to, and a
              directory to stay connected long after.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
