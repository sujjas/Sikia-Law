import {
  Gavel,
  Scale,
  Newspaper,
  FolderOpen,
  BookOpen,
  Target,
  Flame,
  CalendarDays,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Section } from "@/components/layout/Section";
import { HeroGreeting } from "@/components/dashboard/HeroGreeting";
import { StatTile } from "@/components/dashboard/StatTile";
import { LibraryTile } from "@/components/dashboard/LibraryTile";
import {
  CourseUnitFolders,
  type YearGroup,
} from "@/components/dashboard/CourseUnitFolders";
import { NoteThumb, type NoteThumbVariant } from "@/components/dashboard/NoteThumb";
import { WelcomeOverlay } from "@/components/dashboard/WelcomeOverlay";
import { CountUp } from "@/components/ui/CountUp";
import curriculumJson from "@/data/curriculum.json";
import type { Curriculum } from "@/data/curriculum";

/* ── Mock data — to be sourced from curriculum.json + user state later ─ */

const CONTINUE: {
  href: string;
  title: string;
  course: string;
  code: string;
  progress: number;
  variant: NoteThumbVariant;
}[] = [
  {
    href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 1/ADMINISTRATIVE LAW 2.html")}`,
    title: "Administrative Law II — Notes",
    course: "Administrative Law II",
    code: "LAW 2107",
    progress: 64,
    variant: "orange",
  },
  {
    href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 2/EQUITY AND TRUST Q&A.html")}`,
    title: "Equity & Trusts — Q&A",
    course: "Equity & Trusts",
    code: "LAW 2108",
    progress: 28,
    variant: "sky",
  },
  {
    href: `/document?file=${encodeURIComponent("HTML/YR 1 SEM 1/Criminal Law 1 - jorvannotes.html")}`,
    title: "Criminal Law — Jorvan Notes",
    course: "Fundamentals of Criminal Law",
    code: "LAW 1108",
    progress: 82,
    variant: "emerald",
  },
  {
    href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 2/Land Law II-Lecture notes..html")}`,
    title: "Land Law II — Lecture Notes",
    course: "Land Law II",
    code: "LAW 2211",
    progress: 12,
    variant: "indigo",
  },
];

type StatAccent = "orange" | "rust" | "indigo" | "forest";

const ACCENT_TOKENS: Record<StatAccent, { bg: string; fg: string }> = {
  orange: { bg: "var(--orange-wash)", fg: "var(--orange-dark)" },
  rust:   { bg: "var(--color-rust-wash)", fg: "var(--color-rust-dark)" },
  indigo: { bg: "var(--color-indigo-wash)", fg: "var(--color-indigo-dark)" },
  forest: { bg: "var(--color-forest-wash)", fg: "var(--color-forest-dark)" },
};

const STATS: {
  label: string;
  count: number;
  unit: string;
  sub: string;
  icon: LucideIcon;
  accent: StatAccent;
}[] = [
  { label: "Notes left this year", count: 8,  unit: "to go", sub: "of 22 in year 2",          icon: Target,       accent: "orange" },
  { label: "Active streak",        count: 5,  unit: "days",  sub: "your best run this term",  icon: Flame,        accent: "rust" },
  { label: "This week",            count: 23, unit: "notes", sub: "opened, across 4 courses", icon: CalendarDays, accent: "indigo" },
  { label: "Saved this week",      count: 8,  unit: "notes", sub: "in 3 folders",             icon: Bookmark,     accent: "forest" },
];

// Derive the dashboard's course-folder data from the same curriculum.json
// the Notes page uses, so the two views stay in sync.
const curriculum = curriculumJson as Curriculum;
const CURRICULUM: YearGroup[] = curriculum.years.map((y) => ({
  year: y.year as 1 | 2 | 3 | 4,
  label: y.label,
  semesters: y.semesters.map((s) => ({
    semester: s.semester as 1 | 2,
    label: s.label,
    courses: s.courses.map((c) => ({
      code: c.code ?? c.title,
      title: c.title,
      count: c.notes.length,
    })),
  })),
}));

// Total notes per year — used to fill the count on the welcome modal folders.
const YEAR_NOTE_COUNTS: Record<number, number> = Object.fromEntries(
  curriculum.years.map((y) => [
    y.year,
    y.semesters.reduce(
      (n, s) => n + s.courses.reduce((m, c) => m + c.notes.length, 0),
      0
    ),
  ])
);

const LIBRARY = [
  { label: "Case Law", href: "/library?type=case-law", icon: Gavel },
  { label: "Statutes", href: "/library?type=statutes", icon: Scale },
  { label: "Statutory Documents", href: "/library?type=statutory-documents", icon: Newspaper },
  { label: "Decrees", href: "/library?type=decrees", icon: FolderOpen },
  { label: "Legal Notices", href: "/library?type=legal-notices", icon: BookOpen },
];

export default function Home() {
  return (
    <div className="min-h-screen lg:grid lg:[grid-template-columns:var(--width-sidebar)_1fr]">
      <Sidebar
        active="home"
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
        <WelcomeOverlay yearCounts={YEAR_NOTE_COUNTS} />

        <HeroGreeting
          overline="Year 2 — Semester 1, Makerere"
          name="Amelia"
          subtitle="Pick up where you left off, or start something new from your reading list."
        />

        <Section title="Your activity">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-0 lg:divide-x divide-stone-200 lg:rounded-lg lg:bg-white lg:border lg:border-[var(--line-2)] lg:overflow-hidden">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              const tokens = ACCENT_TOKENS[s.accent];
              return (
                <div
                  key={i}
                  className="flex flex-col px-5 py-4 sm:px-6 sm:py-5 bg-white border border-[var(--line-2)] rounded-lg lg:border-0 lg:rounded-none"
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ color: tokens.fg }}
                  >
                    <Icon aria-hidden size={14} strokeWidth={2} />
                    <span className="font-sans text-overline font-medium">
                      {s.label}
                    </span>
                  </div>
                  <div
                    className="font-serif tabular-nums text-num font-medium mt-3 self-start flex items-baseline gap-2"
                    style={{ fontOpticalSizing: "auto" }}
                  >
                    <CountUp value={s.count} />
                    <span className="font-sans text-label-sm font-medium text-stone-500">
                      {s.unit}
                    </span>
                  </div>
                  <div className="font-sans text-label-sm text-stone-600 font-medium mt-2">
                    {s.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Continue reading" cta={{ href: "/notes", label: "All notes" }}>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {CONTINUE.map((n) => (
              <NoteThumb
                key={n.href}
                href={n.href}
                title={n.title}
                course={n.course}
                code={n.code}
                progress={n.progress}
                variant={n.variant}
              />
            ))}
          </div>
        </Section>

        <CourseUnitFolders
          title="Course units"
          curriculum={CURRICULUM}
          initialYear={2}
          initialSemester={1}
        />

        <Section
          title="From the library"
          cta={{ href: "/library", label: "Open library" }}
          noBorder
        >
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            {LIBRARY.map((l) => (
              <LibraryTile key={l.href} {...l} />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}
