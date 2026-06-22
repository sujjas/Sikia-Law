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
      className="flex flex-col gap-5 sm:grid sm:grid-cols-[1fr_auto] sm:gap-8 items-stretch sm:items-end border-b border-[var(--line-2)]"
      style={{ paddingTop: 0, paddingBottom: "var(--hero-py)" }}
    >
      <div className="max-w-[var(--width-hero-max)]">
        <div
          className="font-sans text-overline font-medium text-stone-500"
          style={{ marginBottom: "var(--hero-overline-mb)" }}
        >
          {overline}
        </div>
        <h1 className="font-serif text-h1 sm:text-display font-medium m-0">
          Welcome back, <span style={{ color: "var(--orange)" }}>{name}</span>.
        </h1>
        <p
          className="font-sans text-body text-stone-600"
          style={{ marginTop: "var(--hero-subtitle-mt)", maxWidth: "56ch" }}
        >
          {subtitle}
        </p>
      </div>
      <aside className="flex flex-col sm:items-end gap-4">
        <SearchInput className="w-full sm:w-[var(--width-search-max)]" />
      </aside>
    </section>
  );
}
