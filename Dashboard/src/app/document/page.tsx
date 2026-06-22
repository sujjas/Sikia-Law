import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DocumentReader } from "@/components/document/DocumentReader";
import { ReadingProgress } from "@/components/document/ReadingProgress";
import { findNoteByFile, getPrevNext, getRelatedNotes } from "@/lib/curriculum-lookup";
import { loadNoteHtml } from "@/lib/notes-content";

export default async function DocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const sp = await searchParams;
  const fileParam = sp.file ?? null;

  return (
    <div className="min-h-screen lg:grid lg:[grid-template-columns:var(--width-sidebar)_1fr]">
      <ReadingProgress />
      <Sidebar
        active="notes"
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
        {fileParam ? <DocumentContent file={fileParam} /> : <EmptyState />}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 text-center" style={{ color: "var(--text-3)" }}>
      <p>No document selected.</p>
      <Link href="/notes" className="mt-3 inline-block" style={{ color: "var(--text)" }}>
        ← Back to Notes
      </Link>
    </div>
  );
}

function DocumentContent({ file }: { file: string }) {
  const loc = findNoteByFile(file);
  if (!loc) {
    return (
      <div className="mt-8 text-center" style={{ color: "var(--text-3)" }}>
        <p>Document not found.</p>
        <Link href="/notes" className="mt-3 inline-block" style={{ color: "var(--text)" }}>
          ← Back to Notes
        </Link>
      </div>
    );
  }

  const html = loc.note.html_file ? loadNoteHtml(loc.note.html_file) : null;
  const { prev, next } = getPrevNext(loc);
  const related = getRelatedNotes(loc);

  return (
    <DocumentReader
      breadcrumb={{
        yearLabel: loc.year.label,
        semesterLabel: loc.semester.label,
        courseCode: loc.course.code,
        courseTitle: loc.course.title,
        noteTitle: loc.note.title,
      }}
      noteTitle={loc.note.title}
      noteKind={loc.note.html_file ? "Note" : "PDF"}
      courseCode={loc.course.code}
      courseTitle={loc.course.title}
      yearLabel={loc.year.label}
      semesterLabel={loc.semester.label}
      html={html}
      prev={prev}
      next={next}
      related={related}
    />
  );
}
