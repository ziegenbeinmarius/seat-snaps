export function SectionDivider({ variant = "wave" }: { variant?: "wave" | "scallop" | "leaf" }) {
  if (variant === "wave") {
    return (
      <div className="pointer-events-none relative -my-px select-none overflow-hidden" aria-hidden="true">
        <svg
          className="block w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ height: "clamp(36px, 5vw, 72px)" }}
        >
          <path
            d="M0,50 C180,78 360,22 540,50 C720,78 900,22 1080,50 C1260,78 1440,22 1440,50"
            fill="none"
            stroke="rgba(196,149,106,0.18)"
            strokeWidth="1.5"
          />
          <path
            d="M0,55 C200,75 400,35 600,55 C800,75 1000,35 1200,55 C1350,68 1440,42 1440,55"
            fill="none"
            stroke="rgba(196,149,106,0.1)"
            strokeWidth="1"
          />
          <circle cx="270" cy="36" r="3" fill="rgba(196,149,106,0.16)" />
          <circle cx="540" cy="50" r="2" fill="rgba(196,149,106,0.12)" />
          <circle cx="810" cy="36" r="3.5" fill="rgba(196,149,106,0.14)" />
          <circle cx="1170" cy="42" r="2.5" fill="rgba(196,149,106,0.1)" />
        </svg>
      </div>
    );
  }

  if (variant === "scallop") {
    return (
      <div className="pointer-events-none relative -my-px select-none overflow-hidden" aria-hidden="true">
        <svg
          className="block w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ height: "clamp(28px, 4vw, 56px)" }}
        >
          <path
            d="M0,30 Q72,8 144,30 Q216,52 288,30 Q360,8 432,30 Q504,52 576,30 Q648,8 720,30 Q792,52 864,30 Q936,8 1008,30 Q1080,52 1152,30 Q1224,8 1296,30 Q1368,52 1440,30"
            fill="none"
            stroke="rgba(196,149,106,0.16)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="144" cy="30" r="2.5" fill="rgba(196,149,106,0.14)" />
          <circle cx="432" cy="30" r="2" fill="rgba(196,149,106,0.1)" />
          <circle cx="720" cy="30" r="3" fill="rgba(196,149,106,0.16)" />
          <circle cx="1008" cy="30" r="2" fill="rgba(196,149,106,0.12)" />
          <circle cx="1296" cy="30" r="2.5" fill="rgba(196,149,106,0.1)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="pointer-events-none relative -my-px select-none overflow-hidden" aria-hidden="true">
      <svg
        className="block w-full"
        viewBox="0 0 1440 50"
        preserveAspectRatio="none"
        style={{ height: "clamp(24px, 3vw, 44px)" }}
      >
        {/* Leaf-like swooshes */}
        <path
          d="M0,25 C120,10 240,40 360,25 C420,18 440,32 480,25 C560,12 640,38 720,25 C800,12 880,38 960,25 C1020,18 1040,32 1080,25 C1160,12 1280,38 1440,25"
          fill="none"
          stroke="rgba(196,149,106,0.14)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Small leaf shapes */}
        <ellipse cx="240" cy="25" rx="8" ry="4" transform="rotate(-20 240 25)" fill="rgba(196,149,106,0.08)" />
        <ellipse cx="600" cy="25" rx="6" ry="3" transform="rotate(15 600 25)" fill="rgba(196,149,106,0.07)" />
        <ellipse cx="960" cy="25" rx="8" ry="4" transform="rotate(-15 960 25)" fill="rgba(196,149,106,0.08)" />
        <ellipse cx="1320" cy="25" rx="6" ry="3" transform="rotate(20 1320 25)" fill="rgba(196,149,106,0.06)" />
      </svg>
    </div>
  );
}
