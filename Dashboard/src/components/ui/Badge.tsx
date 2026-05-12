type State = "neutral" | "brand" | "ok" | "warn" | "link" | "danger";

const STATE_CLASSES: Record<State, string> = {
  neutral: "bg-stone-100 text-stone-600",
  brand: "bg-orange-500 text-stone-900 font-bold",
  ok: "bg-[var(--color-forest-wash)] text-[var(--color-forest-dark)]",
  warn: "bg-[var(--color-amber-wash)] text-[var(--color-amber-dark)]",
  link: "bg-[var(--color-indigo-wash)] text-[var(--color-indigo-dark)]",
  danger: "bg-[var(--color-rust-wash)] text-[var(--color-rust-dark)]",
};

export function Badge({
  state = "neutral",
  children,
  className = "",
}: {
  state?: State;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-label-sm font-medium leading-tight ${STATE_CLASSES[state]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Small numeric badge — used in sidebar nav items, etc. */
export function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto px-2.5 py-0.5 rounded-full font-sans text-mono-sm min-w-[26px] text-center bg-orange-100 text-orange-700 font-semibold">
      {count}
    </span>
  );
}
