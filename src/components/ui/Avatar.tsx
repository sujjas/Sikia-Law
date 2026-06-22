export function Avatar({
  initials,
  size = 38,
}: {
  initials: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-sans font-semibold text-stone-600 text-label-sm shrink-0 border border-[var(--line)]"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, var(--color-stone-200), var(--color-stone-100))",
      }}
    >
      {initials}
    </span>
  );
}
