import { SearchInput } from "@/components/ui/SearchInput";

export function HeroGreeting({
  overline,
  name,
  subtitle,
}: {
  overline: string;
  name: string;
  subtitle: string;
}) {
  return (
    <section
      className="grid grid-cols-[1fr_auto] gap-8 items-end border-b border-[var(--line-2)]"
      style={{ paddingTop: 0, paddingBottom: "var(--hero-py)" }}
    >
      <div className="max-w-[var(--width-hero-max)]">
        <div
          className="font-sans text-overline font-medium text-stone-500"
          style={{ marginBottom: "var(--hero-overline-mb)" }}
        >
          {overline}
        </div>
        <h1 className="font-serif text-display font-medium m-0">
          {`Welcome back, ${name}.`}
        </h1>
        <p
          className="font-sans text-body text-stone-600"
          style={{ marginTop: "var(--hero-subtitle-mt)", maxWidth: "56ch" }}
        >
          {subtitle}
        </p>
      </div>
      <aside className="flex flex-col items-end gap-4">
        <SearchInput className="w-[var(--width-search-max)]" />
      </aside>
    </section>
  );
}
