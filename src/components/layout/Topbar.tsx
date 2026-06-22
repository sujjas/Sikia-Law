import { SearchInput } from "@/components/ui/SearchInput";

export function Topbar() {
  return (
    <div
      className="flex items-center gap-3"
      style={{ marginBottom: "var(--topbar-mb)" }}
    >
      <SearchInput className="flex-1 max-w-[var(--width-search-max)]" />
    </div>
  );
}
