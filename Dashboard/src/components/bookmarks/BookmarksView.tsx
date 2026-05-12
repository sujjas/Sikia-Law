"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ChevronDown,
  FileText,
  Gavel,
  Newspaper,
  Plus,
  Scale,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  NoteThumb,
  type NoteThumbVariant,
} from "@/components/dashboard/NoteThumb";
import { Folder, type FolderVariant } from "@/components/dashboard/Folder";

type BookmarkType = "notes" | "case-law" | "statutes" | "docs";

const TYPE_LABEL: Record<BookmarkType, string> = {
  notes: "Note",
  "case-law": "Case",
  statutes: "Statute",
  docs: "Doc",
};

const TYPE_THUMB_VARIANT: Record<BookmarkType, NoteThumbVariant> = {
  notes: "orange",
  "case-law": "petrol",
  statutes: "indigo",
  docs: "forest",
};

const FOLDER_VARIANTS: FolderVariant[] = [
  "orange",
  "petrol",
  "forest",
  "rose",
  "indigo",
  "blue",
];

type Bookmark = {
  type: BookmarkType;
  icon: LucideIcon;
  title: string;
  source: string[];
  folder: string | null;
  when: string;
  href: string;
};

const BOOKMARKS: Bookmark[] = [
  { type: "notes", icon: FileText, title: "Criminal Law — Jorvan Notes", source: ["LAW 1108", "Year 1", "Sem 1"], folder: "Exam revision", when: "2 hours ago", href: `/document?file=${encodeURIComponent("HTML/YR 1 SEM 1/Criminal Law 1 - jorvannotes.html")}` },
  { type: "case-law", icon: Gavel, title: "Uganda v. Kato Jonathan (Criminal Appeal No. 14 of 2021)", source: ["Supreme Court", "12 May 2021", "Criminal Law"], folder: null, when: "Yesterday", href: "/document" },
  { type: "notes", icon: FileText, title: "Land Law II — Lecture Notes", source: ["LAW 2211", "Year 2", "Sem 2"], folder: "Land Law cases", when: "3 days ago", href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 2/Land Law II-Lecture notes..html")}` },
  { type: "case-law", icon: Gavel, title: "Abdalla Nabulere & 2 Others v. Uganda [1979] HCB 77", source: ["Court of Appeal", "1979", "Criminal Law"], folder: "Exam revision", when: "4 days ago", href: "/document" },
  { type: "notes", icon: FileText, title: "Family Law Notes", source: ["LAW 2209", "Year 2", "Sem 2"], folder: null, when: "Last week", href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 1/FAMILY_LAW_NOTES.html")}` },
  { type: "statutes", icon: Scale, title: "The Penal Code Act, Cap. 120", source: ["Cap. 120", "In force", "Criminal Law"], folder: "Exam revision", when: "Last week", href: "/document" },
  { type: "notes", icon: FileText, title: "Equity & Trusts — Q&A", source: ["LAW 2108", "Year 2", "Sem 1"], folder: null, when: "2 weeks ago", href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 2/EQUITY AND TRUST Q&A.html")}` },
  { type: "docs", icon: Newspaper, title: "Statutory Instrument No. 24 of 1965 — Land Acquisition", source: ["SI 24/1965", "Land Law"], folder: "Land Law cases", when: "2 weeks ago", href: "/document" },
  { type: "notes", icon: FileText, title: "Banking — Questions & Answers (Final)", source: ["LAW 3113", "Year 3", "Sem 1"], folder: "Weekend reading", when: "3 weeks ago", href: `/document?file=${encodeURIComponent("HTML/YR 3 SEM 1/BANKING - QNS & ANS - FINAL.html")}` },
  { type: "case-law", icon: Gavel, title: "Uganda v. Ssemwogerere", source: ["Supreme Court", "2019", "Constitutional Law"], folder: null, when: "Last month", href: "/document" },
  { type: "notes", icon: FileText, title: "Administrative Law II Notes", source: ["LAW 2107", "Year 2", "Sem 1"], folder: "Exam revision", when: "Last month", href: `/document?file=${encodeURIComponent("HTML/YR 2 SEM 1/ADMINISTRATIVE LAW 2.html")}` },
  { type: "notes", icon: FileText, title: "Constitutional History — Notes by Dr Onoria", source: ["LAW 1110", "Year 1", "Sem 1"], folder: "Weekend reading", when: "Last month", href: `/document?file=${encodeURIComponent("HTML/YR 1 SEM 1/CONSTITUTIONAL HISTORY NOTES Dr ONORIA-1(4).html")}` },
];

const FOLDERS = ["Exam revision", "Land Law cases", "Weekend reading"];

/* ── Filter facets ────────────────────────────────────────── */

type FacetKey = "Type" | "Folder";

const FACETS: { key: FacetKey; getValues: (b: Bookmark) => string[] }[] = [
  { key: "Type", getValues: (b) => [TYPE_LABEL[b.type]] },
  { key: "Folder", getValues: (b) => (b.folder ? [b.folder] : []) },
];

function makeEmptyFilters(): Record<FacetKey, Set<string>> {
  return { Type: new Set(), Folder: new Set() };
}

function bookmarkToThumb(b: Bookmark) {
  return {
    code: TYPE_LABEL[b.type],
    title: b.title,
    course: b.source[0],
    meta: b.when,
    variant: TYPE_THUMB_VARIANT[b.type],
    href: b.href,
  };
}

/* ───────────────────────────────────────────────────────────── */

export function BookmarksView() {
  const [activeFilters, setActiveFilters] =
    useState<Record<FacetKey, Set<string>>>(makeEmptyFilters);
  const [sort, setSort] = useState("Most recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  const filterMenuRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!filterMenuRef.current?.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  // Drawer: lock body scroll + Escape close.
  useEffect(() => {
    if (!openFolder) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFolder(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [openFolder]);

  const facetValues = useMemo(() => {
    const out: Record<FacetKey, string[]> = { Type: [], Folder: [] };
    for (const f of FACETS) {
      const set = new Set<string>();
      for (const b of BOOKMARKS) for (const v of f.getValues(b)) set.add(v);
      out[f.key] = [...set].sort();
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    let items = BOOKMARKS.slice();
    for (const f of FACETS) {
      const sel = activeFilters[f.key];
      if (sel.size === 0) continue;
      items = items.filter((b) => f.getValues(b).some((v) => sel.has(v)));
    }
    return items;
  }, [activeFilters]);

  const folderCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const f of FOLDERS) out[f] = 0;
    for (const b of BOOKMARKS) if (b.folder) out[b.folder] = (out[b.folder] ?? 0) + 1;
    return out;
  }, []);

  const bookmarksInOpenFolder = useMemo(() => {
    if (!openFolder) return [];
    return BOOKMARKS.filter((b) => b.folder === openFolder);
  }, [openFolder]);

  const activeFilterCount = Object.values(activeFilters).reduce(
    (n, s) => n + s.size,
    0
  );

  const toggleFilter = (facet: FacetKey, value: string) => {
    setActiveFilters((prev) => {
      const nextSet = new Set(prev[facet]);
      if (nextSet.has(value)) nextSet.delete(value);
      else nextSet.add(value);
      return { ...prev, [facet]: nextSet };
    });
  };
  const clearFilters = () => setActiveFilters(makeEmptyFilters());

  // Stagger result cards on filter change.
  useGSAP(
    () => {
      const root = resultsRef.current;
      if (!root) return;
      const cards = root.querySelectorAll<HTMLElement>(".note-thumb");
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
    { scope: resultsRef, dependencies: [filtered] }
  );

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
        <span>Bookmarks</span>
      </nav>

      <header className="mb-6">
        <h1
          className="font-semibold"
          style={{
            fontSize: "var(--text-display)",
            lineHeight: "var(--text-display--line-height)",
            letterSpacing: "var(--text-display--letter-spacing)",
          }}
        >
          Bookmarks
        </h1>
        <p className="mt-2 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
          Notes and library items you&rsquo;ve saved for later.
        </p>
      </header>

      {/* Folders */}
      <div className="mb-4">
        <h2 style={{ fontSize: "var(--text-h4)", fontWeight: 600 }}>Folders</h2>
        <p
          className="mt-1"
          style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}
        >
          Group bookmarks for revision, by topic, or however you like.
        </p>
      </div>

      <div
        className="grid mb-14 gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {FOLDERS.map((name, i) => (
          <FolderButton
            key={name}
            name={name}
            count={folderCounts[name] ?? 0}
            variant={FOLDER_VARIANTS[i % FOLDER_VARIANTS.length]}
            selected={openFolder === name}
            onClick={() => setOpenFolder(name)}
          />
        ))}
        {/* New folder — keep dashed CTA as-is */}
        <button
          type="button"
          className="flex flex-col items-center justify-center text-center transition-all hover:[color:var(--text)] hover:[border-color:var(--text-3)] cursor-pointer"
          style={{
            border: "1.5px dashed var(--line)",
            background: "var(--bg)",
            color: "var(--text-3)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            minHeight: 240,
          }}
        >
          <span
            className="flex items-center justify-center mb-2"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              color: "var(--text-2)",
            }}
          >
            <Plus size={16} />
          </span>
          New folder
        </button>
      </div>

      {/* All bookmarks */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 style={{ fontSize: "var(--text-h4)", fontWeight: 600 }}>
          All bookmarks
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter button + dropdown — same pattern as Library */}
          <div ref={filterMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
              aria-haspopup="menu"
              className="inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${
                  activeFilterCount > 0 ? "var(--text)" : "var(--line)"
                }`,
                background:
                  activeFilterCount > 0 ? "var(--text)" : "var(--surface)",
                color:
                  activeFilterCount > 0 ? "var(--text-inv)" : "var(--text-2)",
                fontSize: "0.82rem",
                fontWeight: 500,
              }}
            >
              <SlidersHorizontal size={12} /> Filter
              {activeFilterCount > 0 && (
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    fontSize: "0.66rem",
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.18)",
                    color: "var(--text-inv)",
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 z-30"
                style={{
                  width: 280,
                  maxHeight: 420,
                  overflowY: "auto",
                  padding: 14,
                  background: "var(--surface)",
                  border: "1px solid var(--line-2)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-3)",
                }}
              >
                {FACETS.map((facet) => {
                  const values = facetValues[facet.key];
                  if (!values.length) return null;
                  const selected = activeFilters[facet.key];
                  return (
                    <div key={facet.key} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="uppercase font-semibold"
                          style={{
                            fontSize: "0.66rem",
                            letterSpacing: "0.1em",
                            color: "var(--text-3)",
                          }}
                        >
                          {facet.key}
                        </span>
                        {selected.size > 0 && (
                          <span
                            style={{ fontSize: "0.66rem", color: "var(--text-3)" }}
                          >
                            {selected.size} selected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {values.map((value) => {
                          const active = selected.has(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              role="menuitemcheckbox"
                              aria-checked={active}
                              onClick={() => toggleFilter(facet.key, value)}
                              className="filter-row flex items-center justify-between text-left cursor-pointer"
                              style={{
                                padding: "7px 10px",
                                borderRadius: "var(--radius-md)",
                                border: 0,
                                background: active
                                  ? "var(--color-stone-150)"
                                  : "transparent",
                                color: active ? "var(--text)" : "var(--text-2)",
                                fontSize: "var(--text-body-sm)",
                                fontWeight: active ? 600 : 500,
                                transition:
                                  "background 0.12s ease, color 0.12s ease",
                              }}
                            >
                              <span className="truncate" style={{ minWidth: 0 }}>
                                {value}
                              </span>
                              {active && (
                                <span
                                  style={{ color: "var(--text)", marginLeft: 8 }}
                                  aria-hidden
                                >
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-1 cursor-pointer transition-colors hover:[color:var(--text)]"
                    style={{
                      fontSize: "var(--text-meta)",
                      color: "var(--text-3)",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                    }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sort — appearance-none + custom chevron, same as Library */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none cursor-pointer"
              style={{
                padding: "6px 30px 6px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                fontSize: "0.82rem",
                color: "var(--text-2)",
              }}
            >
              <option>Most recent</option>
              <option>Title</option>
              <option>Type</option>
            </select>
            <ChevronDown
              aria-hidden
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500"
            />
          </div>
        </div>
      </div>

      {/* Results — NoteThumb grid (same as Library) */}
      <div ref={resultsRef} className="grid gap-4 grid-cols-3">
        {filtered.map((b, i) => {
          const t = bookmarkToThumb(b);
          return (
            <NoteThumb
              key={`${i}-${b.title}`}
              href={t.href}
              title={t.title}
              code={t.code}
              course={t.course}
              meta={t.meta}
              variant={t.variant}
              style={{ minHeight: 140 }}
            />
          );
        })}
      </div>

      {/* Folder drawer */}
      <FolderDrawer
        open={openFolder !== null}
        name={openFolder}
        bookmarks={bookmarksInOpenFolder}
        onClose={() => setOpenFolder(null)}
      />
    </>
  );
}

/* Clickable Folder card — mirrors the Notes-page FolderButton so the
 * wallet visual is consistent across the app. */
function FolderButton({
  name,
  count,
  variant,
  selected,
  onClick,
}: {
  name: string;
  count: number;
  variant: FolderVariant;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Open ${name} folder`}
      className={`folder-card folder-card--${variant} text-left${
        selected ? " is-selected" : ""
      }`}
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
            <div className="folder-card__title truncate">{name}</div>
            <div className="folder-card__subtitle truncate">Bookmark folder</div>
          </div>
        </div>
        <div className="folder-card__count">
          {count} {count === 1 ? "Item" : "Items"}
        </div>
      </div>
    </button>
  );
}

function FolderDrawer({
  open,
  name,
  bookmarks,
  onClose,
}: {
  open: boolean;
  name: string | null;
  bookmarks: Bookmark[];
  onClose: () => void;
}) {
  return (
    <>
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
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={name ? `${name} folder` : "Folder drawer"}
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
        {name && (
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
                  Bookmark folder
                </div>
                <h2
                  className="font-serif font-semibold m-0"
                  style={{
                    fontSize: "var(--text-h2)",
                    lineHeight: "var(--text-h2--line-height)",
                    letterSpacing: "var(--text-h2--letter-spacing)",
                  }}
                >
                  {name}
                </h2>
                <p
                  className="mt-1"
                  style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}
                >
                  {bookmarks.length}{" "}
                  {bookmarks.length === 1 ? "item" : "items"}
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
              {bookmarks.length === 0 ? (
                <p
                  style={{
                    color: "var(--text-3)",
                    fontSize: "var(--text-body-sm)",
                  }}
                >
                  No bookmarks in this folder yet.
                </p>
              ) : (
                <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                  {bookmarks.map((b, i) => {
                    const t = bookmarkToThumb(b);
                    return (
                      <NoteThumb
                        key={i}
                        href={t.href}
                        title={t.title}
                        code={t.code}
                        course={t.course}
                        meta={t.meta}
                        variant={t.variant}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
