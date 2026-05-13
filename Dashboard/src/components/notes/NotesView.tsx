"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Folder as FolderIcon, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { Curriculum, Course, Note, Semester } from "@/data/curriculum";
import {
  NoteThumb,
  noteThumbVariantFor,
} from "@/components/dashboard/NoteThumb";
import type { FolderVariant } from "@/components/dashboard/Folder";
import { haptic } from "@/lib/haptics";

const FOLDER_VARIANT_CYCLE: FolderVariant[] = [
  "orange",
  "petrol",
  "forest",
  "rose",
  "indigo",
  "blue",
];

type Props = {
  curriculum: Curriculum;
  initialYear: number;
  initialCourse: string | null;
};

function noteHref(note: Note) {
  if (note.html_file) {
    return `/document?file=${encodeURIComponent(note.html_file)}`;
  }
  return `/Notes/${note.file}`;
}

export function NotesView({ curriculum, initialYear, initialCourse }: Props) {
  const years = curriculum.years;
  const validYear = years.find((y) => y.year === initialYear) ? initialYear : years[0]?.year ?? 1;
  const [activeYear, setActiveYear] = useState<number>(validYear);

  const tabsRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [hasMeasured, setHasMeasured] = useState(false);

  // Position the indicator under the active tab. useLayoutEffect runs after
  // DOM mutations but before paint, so first paint already has it in place.
  useLayoutEffect(() => {
    const btn = buttonRefs.current[activeYear];
    const indicator = indicatorRef.current;
    if (!btn || !indicator) return;
    indicator.style.left = `${btn.offsetLeft}px`;
    indicator.style.width = `${btn.offsetWidth}px`;
    // Skip the transition on first render so it doesn't slide in from 0/0.
    if (!hasMeasured) setHasMeasured(true);
  }, [activeYear, hasMeasured]);

  const yearData = useMemo(
    () => years.find((y) => y.year === activeYear) ?? years[0],
    [years, activeYear]
  );

  const totals = useMemo(() => {
    const courseCount = yearData.semesters.reduce((s, sm) => s + sm.courses.length, 0);
    const noteCount = yearData.semesters.reduce(
      (s, sm) => s + sm.courses.reduce((sc, c) => sc + c.notes.length, 0),
      0
    );
    return { courseCount, noteCount };
  }, [yearData]);

  return (
    <>
      <nav
        className="flex items-center gap-1.5 mb-3.5"
        style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
      >
        <Link href="/" className="hover:[color:var(--text)] no-underline">
          Home
        </Link>
        <span>/</span>
        <span>Notes</span>
      </nav>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-6 sm:mb-7">
        <div>
          <h1 className="font-serif text-h1 sm:text-display font-semibold tracking-tight">
            Notes
          </h1>
          <p className="mt-2 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
            Your full curriculum, organised by year and semester. Pick a year to see the
            courses you take and the notes attached.
          </p>
        </div>
        <div className="text-[color:var(--text-3)]" style={{ fontSize: "var(--text-body-sm)" }}>
          {totals.courseCount} courses · {totals.noteCount} notes
        </div>
      </header>

      <div
        ref={tabsRef}
        role="tablist"
        className="relative inline-flex items-center gap-0.5 mb-7 p-1 w-fit bg-stone-150 rounded-full"
      >
        {/* Sliding active indicator — animates left & width to track the active tab */}
        <div
          ref={indicatorRef}
          aria-hidden
          className={`absolute top-1 bottom-1 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-stone-200 ${
            hasMeasured ? "transition-[left,width] duration-300 ease-[var(--ease-out)]" : ""
          }`}
          style={{ left: 0, width: 0 }}
        />
        {years.map((y) => {
          const active = y.year === activeYear;
          return (
            <button
              key={y.year}
              ref={(el) => {
                buttonRefs.current[y.year] = el;
              }}
              role="tab"
              aria-selected={active}
              onClick={() => {
                haptic("selection");
                setActiveYear(y.year);
              }}
              className={`relative z-10 px-4 sm:px-5 py-2 rounded-full font-sans text-label-sm cursor-pointer transition-colors whitespace-nowrap ${
                active
                  ? "text-stone-900 font-semibold"
                  : "text-stone-700 font-medium hover:text-stone-900"
              }`}
            >
              {y.label.replace(/^Year\s+/i, "Yr ")}
            </button>
          );
        })}
      </div>

      <div key={activeYear}>
        <FolderGridWithDrawer
          semesters={yearData.semesters}
          yearLabel={yearData.label}
        />
      </div>

      <style>{`
        @keyframes paneFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}


/* ────────────────────────────────────────────────────────────── */
/*  Picker helpers — small layout variants for the Notes page    */
/* ────────────────────────────────────────────────────────────── */

function SemesterHeader({ sem }: { sem: Semester }) {
  const noteCount = sem.courses.reduce((n, c) => n + c.notes.length, 0);
  return (
    <div className="flex items-baseline gap-3 mb-4 flex-wrap">
      <h2
        className="uppercase font-bold whitespace-nowrap"
        style={{
          fontSize: "var(--text-meta)",
          letterSpacing: "0.1em",
          color: "var(--text-2)",
        }}
      >
        {sem.label}
      </h2>
      <span
        className="whitespace-nowrap"
        style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
      >
        {sem.courses.length} courses · {noteCount} notes
      </span>
      <span
        aria-hidden
        className="flex-1 h-px ml-1.5 hidden sm:block"
        style={{ background: "var(--line-2)" }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Folder grid + side drawer — Option A                          */
/* ────────────────────────────────────────────────────────────── */

type DrawerSelection = {
  course: Course;
  semLabel: string;
  yearLabel: string;
  paletteIndex: number;
} | null;

function FolderGridWithDrawer({
  semesters,
  yearLabel,
}: {
  semesters: Semester[];
  yearLabel: string;
}) {
  const [selection, setSelection] = useState<DrawerSelection>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!selection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelection(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selection]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!selection) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selection]);

  // Stagger the folder cards in whenever the active year/semester data changes.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const cards = root.querySelectorAll<HTMLElement>(".folder-card");
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.04,
          overwrite: true,
          clearProps: "opacity,transform",
        }
      );
    },
    { scope: rootRef, dependencies: [semesters] }
  );

  return (
    <div ref={rootRef}>
      {semesters.map((sem) => (
        <section key={sem.semester} className="mb-12">
          <SemesterHeader sem={sem} />
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {sem.courses.map((course, i) => {
              const folderVariant =
                FOLDER_VARIANT_CYCLE[i % FOLDER_VARIANT_CYCLE.length];
              return (
                <FolderButton
                  key={course.code ?? course.title}
                  course={course}
                  yearLabel={yearLabel}
                  semLabel={sem.label}
                  variant={folderVariant}
                  selected={selection?.course === course}
                  onClick={() => {
                    haptic("medium");
                    setSelection({
                      course,
                      semLabel: sem.label,
                      yearLabel,
                      paletteIndex: i,
                    });
                  }}
                />
              );
            })}
          </div>
        </section>
      ))}

      <Drawer
        open={selection !== null}
        selection={selection}
        onClose={() => {
          haptic("light");
          setSelection(null);
        }}
      />
    </div>
  );
}

/* A clickable wrapper that re-uses the Folder card visual but fires
 * onClick (the real Folder is a Link). */
function FolderButton({
  course,
  yearLabel,
  semLabel,
  variant,
  selected = false,
  onClick,
}: {
  course: Course;
  yearLabel: string;
  semLabel: string;
  variant: FolderVariant;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Open ${course.title}`}
      className={`folder-card folder-card--${variant} text-left${selected ? " is-selected" : ""}`}
    >
      <div className="folder-card__top">
        <div className="folder-card__cover">
          <div className="folder-card__papers">
            <div className="folder-card__paper folder-card__paper--1" />
            <div className="folder-card__paper folder-card__paper--2" />
            <div className="folder-card__paper folder-card__paper--3">
              <div className="folder-card__lines">
                {Array.from({ length: 13 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="folder-card__bottom">
        <div className="folder-card__title-row">
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="folder-card__title truncate">{course.title}</div>
            <div className="folder-card__subtitle truncate">
              {yearLabel} · {semLabel}
            </div>
          </div>
        </div>
        <div className="folder-card__count">
          {course.notes.length} {course.notes.length === 1 ? "Note" : "Notes"}
        </div>
      </div>
    </button>
  );
}

function Drawer({
  open,
  selection,
  onClose,
}: {
  open: boolean;
  selection: DrawerSelection;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,15,16,0.32)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.24s var(--ease-out)",
          zIndex: 40,
        }}
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={selection ? `${selection.course.title} — notes` : "Notes drawer"}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(560px, 92vw)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--line-2)",
          boxShadow: open ? "0 20px 48px -16px rgba(0,0,0,0.2)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.32s var(--ease-out)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selection && (
          <DrawerContent selection={selection} onClose={onClose} />
        )}
      </aside>
    </>
  );
}

function DrawerContent({
  selection,
  onClose,
}: {
  selection: NonNullable<DrawerSelection>;
  onClose: () => void;
}) {
  const { course, yearLabel, semLabel, paletteIndex } = selection;
  const thumbVariant = noteThumbVariantFor(paletteIndex);

  return (
    <>
      <header
        className="flex items-start justify-between gap-4"
        style={{
          padding: "22px 24px 18px",
          borderBottom: "1px solid var(--line-2)",
        }}
      >
        <div className="min-w-0">
          <div
            className="uppercase mb-1"
            style={{
              fontSize: "var(--text-mono-sm)",
              letterSpacing: "var(--text-mono-sm--letter-spacing)",
              color: "var(--text-3)",
              fontWeight: 500,
            }}
          >
            {yearLabel} · {semLabel}
            {course.code && <> · {course.code}</>}
          </div>
          <h2
            className="font-serif font-semibold m-0"
            style={{
              fontSize: "var(--text-h2)",
              lineHeight: "var(--text-h2--line-height)",
              letterSpacing: "var(--text-h2--letter-spacing)",
            }}
          >
            {course.title}
          </h2>
          <p
            className="mt-1"
            style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}
          >
            {course.notes.length} {course.notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex items-center justify-center cursor-pointer transition-colors hover:[background:var(--surface-2)]"
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-2)",
            background: "transparent",
            color: "var(--text-2)",
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "20px 24px 28px" }}
      >
        {course.notes.length === 0 ? (
          <p style={{ color: "var(--text-3)", fontSize: "var(--text-body-sm)" }}>
            No notes attached for this course yet.
          </p>
        ) : (
          <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {course.notes.map((note, j) => (
              <NoteThumb
                key={j}
                href={noteHref(note)}
                title={note.title}
                code={course.code ?? undefined}
                meta={note.html_file ? "Note" : "PDF"}
                variant={thumbVariant}
                external={!note.html_file}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
