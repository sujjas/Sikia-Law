export function StatTile({
  label,
  value,
  sub,
  primary = false,
}: {
  label: string;
  value: string;
  sub: string;
  primary?: boolean;
}) {
  return (
    <div
      className="bg-white border border-[var(--line-2)] rounded-lg flex flex-col"
      style={{
        paddingInline: "var(--stat-px)",
        paddingTop: "var(--stat-pt)",
        paddingBottom: "var(--stat-pb)",
      }}
    >
      <div className="font-sans text-overline text-stone-500 font-medium">
        {label}
      </div>
      <div
        className={`font-serif tabular-nums text-num font-medium self-start ${
          primary ? "border-b-[var(--stat-underline-h)] border-orange-500" : ""
        }`}
        style={{
          fontOpticalSizing: "auto",
          marginTop: "var(--stat-value-mt)",
          paddingBottom: primary ? "var(--stat-underline-pb)" : 0,
        }}
      >
        {value}
      </div>
      <div
        className="font-sans text-label-sm text-stone-600 font-medium"
        style={{ marginTop: "var(--stat-sub-mt)" }}
      >
        {sub}
      </div>
    </div>
  );
}
