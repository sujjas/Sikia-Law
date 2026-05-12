export function ProgressThin({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="flex-1 rounded-full bg-stone-100 overflow-hidden"
      style={{ height: "var(--progress-h)" }}
    >
      <div
        className="h-full bg-stone-900 rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
