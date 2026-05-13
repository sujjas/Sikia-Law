import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BookmarksView } from "@/components/bookmarks/BookmarksView";

export default function BookmarksPage() {
  return (
    <div className="min-h-screen lg:grid lg:[grid-template-columns:var(--width-sidebar)_1fr]">
      <Sidebar
        active="bookmarks"
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
        <BookmarksView />
      </main>
    </div>
  );
}
