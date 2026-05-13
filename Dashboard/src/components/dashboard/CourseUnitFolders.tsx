"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Folder, type FolderVariant } from "./Folder";
import { haptic } from "@/lib/haptics";

export type CourseUnit = {
  code: string;
  title: string;
  count: number;
};

export type SemesterGroup = {
  semester: 1 | 2;
  label: string;
  courses: CourseUnit[];
};

export type YearGroup = {
  year: 1 | 2 | 3 | 4;
  label: string;
  semesters: SemesterGroup[];
};

const VARIANT_CYCLE: FolderVariant[] = ["orange", "petrol", "forest", "rose", "indigo", "blue"];

export function CourseUnitFolders({
  curriculum,
  initialYear = 2,
  initialSemester = 2,
  title,
}: {
  curriculum: YearGroup[];
  initialYear?: 1 | 2 | 3 | 4;
  initialSemester?: 1 | 2;
  /** When provided, renders an inline section header with this title on the
   * left and the year/semester picker on the right. */
  title?: string;
}) {
  const [activeYear, setActiveYear] = useState<1 | 2 | 3 | 4>(initialYear);
  const [activeSemester, setActiveSemester] = useState<1 | 2>(initialSemester);

  const yearIndicatorRef = useRef<HTMLDivElement | null>(null);
  const yearCellRefs = useRef<Record<number, HTMLElement | null>>({});
  const [yearMeasured, setYearMeasured] = useState(false);
  const gridWrapRef = useRef<HTMLDivElement | null>(null);

  // Stagger folder cards in when the active year/semester changes.
  useGSAP(
    () => {
      const root = gridWrapRef.current;
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
    { scope: gridWrapRef, dependencies: [activeYear, activeSemester] }
  );

  useLayoutEffect(() => {
    const cell = yearCellRefs.current[activeYear];
    const ind = yearIndicatorRef.current;
    if (!cell || !ind) return;
    ind.style.left = `${cell.offsetLeft}px`;
    ind.style.width = `${cell.offsetWidth}px`;
    if (!yearMeasured) setYearMeasured(true);
  }, [activeYear, activeSemester, yearMeasured]);

  const activeYearGroup = useMemo(
    () => curriculum.find((y) => y.year === activeYear) ?? curriculum[0],
    [curriculum, activeYear],
  );

  const activeSem = useMemo(
    () =>
      activeYearGroup.semesters.find((s) => s.semester === activeSemester) ??
      activeYearGroup.semesters[0],
    [activeYearGroup, activeSemester],
  );

  const shortLabel = (semLabel: string) =>
    semLabel.replace(/Semester\s+/i, "SEM ").replace(/Sem\.?\s*/i, "SEM ");
  const shortYearLabel = (yearLabel: string) =>
    yearLabel.replace(/^Year\s+/i, "Yr ");

  const yearPicker = (
    <div
      className="relative flex items-center bg-stone-150 rounded-full self-start"
      style={{ gap: "2px", padding: "var(--year-strip-pad)" }}
      role="tablist"
      aria-label="Select year and semester"
    >
      {/* Sliding indicator — sits behind year cells, animates left+width */}
      <div
        ref={yearIndicatorRef}
        aria-hidden
        className={`absolute top-1 bottom-1 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-stone-200 ${
          yearMeasured
            ? "transition-[left,width] duration-300 ease-[var(--ease-out)]"
            : ""
        }`}
        style={{ left: 0, width: 0 }}
      />
      {curriculum.map((y) => {
        const isActive = y.year === activeYear;

        if (!isActive) {
          return (
            <button
              key={y.year}
              ref={(el) => {
                yearCellRefs.current[y.year] = el;
              }}
              type="button"
              role="tab"
              aria-selected={false}
              onClick={() => {
                haptic("selection");
                setActiveYear(y.year);
                const stillHasSem = y.semesters.some((s) => s.semester === activeSemester);
                if (!stillHasSem) {
                  setActiveSemester(y.semesters[0]?.semester ?? 1);
                }
              }}
              className="relative z-10 rounded-full font-sans text-label-sm font-medium text-stone-700 hover:text-stone-900 cursor-pointer transition-colors whitespace-nowrap"
              style={{
                paddingInline: "var(--year-btn-px)",
                paddingBlock: "var(--year-btn-py)",
              }}
            >
              {shortYearLabel(y.label)}
            </button>
          );
        }

        // Active year cell — text + inline semester sub-picker. The white
        // pill behind it is the floating indicator above.
        return (
          <div
            key={y.year}
            ref={(el) => {
              yearCellRefs.current[y.year] = el;
            }}
            role="tab"
            aria-selected
            className="relative z-10 inline-flex items-center"
            // Asymmetric right padding compensates for the SEM badge's tighter
            // 9 px end-padding so the white pill reads as balanced.
            style={{ padding: "2px 7px 2px 2px", gap: 4 }}
          >
            <span
              className="font-sans text-label-sm font-semibold text-stone-900 whitespace-nowrap"
              style={{
                paddingInline: "calc(var(--year-btn-px) - 2px)",
                paddingBlock: "calc(var(--year-btn-py) - 2px)",
              }}
            >
              {shortYearLabel(y.label)}
            </span>
            <div className="flex items-center" role="tablist" aria-label="Select semester">
              {y.semesters.map((s) => {
                const semActive = s.semester === activeSemester;
                return (
                  <button
                    key={s.semester}
                    type="button"
                    role="tab"
                    aria-selected={semActive}
                    onClick={() => {
                      haptic("selection");
                      setActiveSemester(s.semester);
                    }}
                    className="font-sans uppercase cursor-pointer transition-colors"
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.04em",
                      padding: "2px 9px",
                      borderRadius: 999,
                      // Border kept transparent on inactive so widths stay even
                      // and the white indicator pill shows through.
                      border: `1px solid ${
                        semActive ? "var(--line-2)" : "transparent"
                      }`,
                      background: semActive ? "var(--color-stone-150)" : "transparent",
                      color: semActive ? "var(--text-2)" : "var(--text-3)",
                      fontWeight: semActive ? 600 : 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {shortLabel(s.label)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const grid = (
    <div ref={gridWrapRef}>
      {activeSem.courses.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {activeSem.courses.map((c, i) => (
            <Folder
              key={c.code}
              href={`/notes?year=${activeYear}&course=${encodeURIComponent(c.code)}`}
              title={c.title}
              subtitle={`${activeYearGroup.label} · ${activeSem.label}`}
              count={c.count}
              countLabel="Notes"
              variant={VARIANT_CYCLE[i % VARIANT_CYCLE.length]}
            />
          ))}
        </div>
      ) : (
        <div className="text-stone-500 text-body-sm border border-dashed border-[var(--line-2)] rounded-xl px-5 py-8 text-center">
          No course units listed for {activeYearGroup.label} · {activeSem.label} yet.
        </div>
      )}
    </div>
  );

  if (title) {
    return (
      <section
        className="border-b border-[var(--line-2)]"
        style={{ paddingBlock: "var(--section-py)" }}
      >
        <div
          className="flex items-center justify-between gap-4 flex-wrap"
          style={{ marginBottom: "var(--section-head-mb)" }}
        >
          <h2 className="font-serif text-h2 font-medium m-0">{title}</h2>
          {yearPicker}
        </div>
        {grid}
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {yearPicker}
      {grid}
    </div>
  );
}
