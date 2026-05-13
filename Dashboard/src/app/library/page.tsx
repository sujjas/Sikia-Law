import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { LibraryView } from "@/components/library/LibraryView";

const VALID_CATEGORIES = new Set([
  "all",
  "case-law",
  "statutes",
  "statutory-documents",
  "decrees",
  "legal-notices",
]);

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const initialCategory = sp.type && VALID_CATEGORIES.has(sp.type) ? sp.type : "all";

  return (
    <div className="min-h-screen lg:grid lg:[grid-template-columns:var(--width-sidebar)_1fr]">
      <Sidebar
        active="library"
        user={{ initials: "AM", name: "Amelia M.", meta: "Year 2 · Makerere" }}
      />
      <main
        className="page-panel min-w-0"
        style={{
          paddingInline: "var(--page-px)",
          paddingTop: "var(--page-pt)",
          paddingBottom: "var(--page-pb)",
        }}
      >
        <Topbar />
        <LibraryView initialCategory={initialCategory} />
      </main>
    </div>
  );
}
