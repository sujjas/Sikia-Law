import { LinkPill } from "@/components/ui/LinkPill";

export function Section({
  title,
  cta,
  children,
  noBorder = false,
}: {
  title: string;
  cta?: { href: string; label: string };
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <section
      className={noBorder ? "" : "border-b border-[var(--line-2)]"}
      style={{
        paddingBlock: "var(--section-py)",
      }}
    >
      <div
        className="flex items-baseline justify-between gap-4"
        style={{ marginBottom: "var(--section-head-mb)" }}
      >
        <h2 className="font-serif text-h2 font-medium m-0">{title}</h2>
        {cta && <LinkPill href={cta.href}>{cta.label}</LinkPill>}
      </div>
      {children}
    </section>
  );
}
