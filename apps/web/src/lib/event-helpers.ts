export const EVENT_TYPE_GRADIENT: Record<string, string> = {
  wedding: "linear-gradient(135deg, #d4a8b4 0%, #b56b7e 100%)",
  birthday: "linear-gradient(135deg, #f8a44c 0%, #e8623a 100%)",
  corporate: "linear-gradient(135deg, #4a7fe0 0%, #2558c4 100%)",
  other: "linear-gradient(135deg, #c4a882 0%, #a07850 100%)",
};

export const EVENT_TYPE_GRADIENT_BANNER: Record<string, string> = {
  wedding: "linear-gradient(120deg, #d4a8b4 0%, #b56b7e 100%)",
  birthday: "linear-gradient(120deg, #f8a44c 0%, #e8623a 100%)",
  corporate: "linear-gradient(120deg, #4a7fe0 0%, #2558c4 100%)",
  other: "linear-gradient(120deg, #c4a882 0%, #a07850 100%)",
};

export const EVENT_TYPE_LABEL: Record<string, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Event",
};

export function getTypeGradient(type: string, variant: "card" | "banner" = "card"): string {
  const map = variant === "banner" ? EVENT_TYPE_GRADIENT_BANNER : EVENT_TYPE_GRADIENT;
  return map[type] ?? map.other;
}

export function getTypeLabel(type: string): string {
  return EVENT_TYPE_LABEL[type] ?? "Event";
}
