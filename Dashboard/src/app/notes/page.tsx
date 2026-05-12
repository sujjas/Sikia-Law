import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { NotesView } from "@/components/notes/NotesView";
import curriculumJson from "@/data/curriculum.json";
import type { Curriculum } from "@/data/curriculum";

const curriculum = curriculumJson as Curriculum;

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; course?: string }>;
}) {
  const sp = await searchParams;
  const initialYear = sp.year ? Number(sp.year) : 2;
  const initialCourse = sp.course ?? null;

  return (
    <div
      className="grid min-h-screen"
      style={{ gridTemplateColumns: "var(--width-sidebar) 1fr" }}
    >
      <Sidebar
        active="notes"
        user={{ initials: "AM", name: "Amelia M.", meta: "Year 2 · Makerere" }}
      />
      <main
        className="min-w-0"
        style={{
          paddingInline: "var(--page-px)",
          paddingTop: "var(--page-pt)",
          paddingBottom: "var(--page-pb)",
        }}
      >
        <Topbar />
        <NotesView
          curriculum={curriculum}
          initialYear={initialYear}
          initialCourse={initialCourse}
        />
      </main>
    </div>
  );
}
