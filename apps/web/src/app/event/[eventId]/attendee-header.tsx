import { UserRound } from "lucide-react";

interface Props {
  name: string;
}

export function AttendeeHeader({ name }: Props) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2"
      style={{
        background: "var(--event-nav-bg, rgba(255, 248, 238, 0.92))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <UserRound
        className="h-4 w-4 shrink-0"
        style={{ color: "var(--event-active-color, #a07850)" }}
      />
      <span
        className="text-sm font-medium truncate"
        style={{ color: "var(--event-active-color, #a07850)" }}
      >
        {name}
      </span>
    </header>
  );
}
