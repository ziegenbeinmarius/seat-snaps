import Image from "next/image";

const cardDelays = ["delay-100", "delay-200", "delay-300", "delay-500"] as const;

const features = [
  {
    title: "Seating Plans",
    description: "Drag-and-drop table layouts your guests can browse on their phones.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="3" r="1.5" />
        <circle cx="19.8" cy="7.5" r="1.5" />
        <circle cx="19.8" cy="16.5" r="1.5" />
        <circle cx="12" cy="21" r="1.5" />
        <circle cx="4.2" cy="16.5" r="1.5" />
        <circle cx="4.2" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: "Photo Sharing",
    description: "Guests snap and share moments in a collaborative event gallery.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M9 2h6" />
      </svg>
    ),
  },
  {
    title: "Guest Directory",
    description: "A searchable list so attendees can connect with each other.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Live Broadcasts",
    description: "Send real-time announcements and updates to every guest's screen.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M4.9 19.1A14 14 0 0 1 2 12c0-3.5 1.3-6.7 3.4-9.1" />
        <path d="M8.1 15.9A8 8 0 0 1 6 12c0-1.8.6-3.5 1.7-4.9" />
        <circle cx="12" cy="12" r="2" />
        <path d="M15.9 8.1A8 8 0 0 1 18 12c0 1.8-.6 3.5-1.7 4.9" />
        <path d="M19.1 4.9A14 14 0 0 1 22 12c0 3.5-1.3 6.7-3.4 9.1" />
      </svg>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-10 sm:text-left">
        <div data-animate="fade-up" className="landing-animate flex-shrink-0 delay-100">
          <Image
            src="/images/koala-presenting.png"
            alt="SeatSnaps Koala mascot presenting with a thumbs up"
            width={220}
            height={302}
          />
        </div>
        <div data-animate="fade-up" className="landing-animate delay-200">
          <h2
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 18%)" }}
          >
            Everything your event needs
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
            From the guest list to the last photo, SeatSnaps has every detail covered — so you can focus on the celebration.
          </p>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {features.map((f, i) => (
          <div
            key={f.title}
            data-animate="fade-up"
            className={`landing-animate ${cardDelays[i]} dashboard-glass rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg`}
          >
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 hover:scale-110"
              style={{ background: "hsl(28 65% 44% / 0.1)", color: "hsl(28 65% 44%)" }}
            >
              {f.icon}
            </div>
            <h3 className="text-lg font-semibold" style={{ color: "hsl(24 12% 18%)" }}>
              {f.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
