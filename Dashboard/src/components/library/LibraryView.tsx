"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  BookOpen,
  ChevronDown,
  FolderOpen,
  Gavel,
  Newspaper,
  Scale,
  Search as SearchIcon,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import {
  NoteThumb,
  type NoteThumbVariant,
} from "@/components/dashboard/NoteThumb";
import { haptic } from "@/lib/haptics";

type CategoryId =
  | "all"
  | "case-law"
  | "statutes"
  | "statutory-documents"
  | "decrees"
  | "legal-notices";

type Category = {
  id: CategoryId;
  label: string;
  icon: LucideIcon | null;
  count: number;
};

type Result = {
  cat: Exclude<CategoryId, "all">;
  tag: string;
  title: string;
  sub: string;
  source: string[];
};

const CATEGORIES: Category[] = [
  { id: "all", label: "All", icon: null, count: 2465 },
  { id: "case-law", label: "Case Law", icon: Gavel, count: 1243 },
  { id: "statutes", label: "Statutes", icon: Scale, count: 312 },
  { id: "statutory-documents", label: "Statutory Documents", icon: Newspaper, count: 587 },
  { id: "decrees", label: "Decrees", icon: FolderOpen, count: 89 },
  { id: "legal-notices", label: "Legal Notices", icon: BookOpen, count: 234 },
];

/** Short label that shows in the colored chip on each thumbnail. */
const CAT_SHORT_LABEL: Record<Exclude<CategoryId, "all">, string> = {
  "case-law": "Case",
  statutes: "Statute",
  "statutory-documents": "Statutory",
  decrees: "Decree",
  "legal-notices": "Notice",
};

/** Folder palette mapped per category so thumbs are color-coded by kind. */
const CAT_THUMB_VARIANT: Record<Exclude<CategoryId, "all">, NoteThumbVariant> = {
  "case-law": "indigo",
  statutes: "violet",
  "statutory-documents": "emerald",
  decrees: "rose",
  "legal-notices": "amber",
};

/** Stand-in document for each category — the mock library data doesn't have
 * its own bodies yet, so each card opens a curriculum note that fits the
 * category so /document has real content to render. */
const CAT_DEFAULT_DOC: Record<Exclude<CategoryId, "all">, string> = {
  "case-law": "HTML/YR 1 SEM 1/Criminal Law 1 - jorvannotes.html",
  statutes: "HTML/YR 1 SEM 1/CONSTITUTIONAL HISTORY NOTES Dr ONORIA-1(4).html",
  "statutory-documents": "HTML/YR 1 SEM 1/1900 BUGANDA AGREEMENT.html",
  decrees: "HTML/YR 2 SEM 2/EQUITY AND TRUST Q&A.html",
  "legal-notices": "HTML/YR 1 SEM 2/Legal Method Notes 1.html",
};

type FacetKey = "Year" | "Area of law" | "Source";

/** Extractors that pull facet values from a result row. */
const FACETS: { key: FacetKey; getValues: (r: Result) => string[] }[] = [
  {
    key: "Year",
    getValues: (r) => {
      for (const s of r.source) {
        const m = s.match(/\b(19|20)\d{2}\b/);
        if (m) return [m[0]];
      }
      return [];
    },
  },
  {
    key: "Area of law",
    getValues: (r) => {
      const last = r.source[r.source.length - 1] ?? "";
      return last
        .split(" · ")
        .map((s) => s.trim())
        .filter(Boolean);
    },
  },
  {
    key: "Source",
    getValues: (r) => (r.source[0] ? [r.source[0]] : []),
  },
];

const RESULTS: Result[] = [
  {
    cat: "case-law",
    tag: "Case · Supreme Court",
    title: "Uganda v. Kato Jonathan (Criminal Appeal No. 14 of 2021)",
    sub: "The judgment reaffirms the duty of a trial court to exercise the greatest caution before convicting on the basis of identification evidence given under difficult conditions.",
    source: ["Supreme Court of Uganda", "Decided 12 May 2021", "Criminal Law · Evidence"],
  },
  {
    cat: "case-law",
    tag: "Case · Court of Appeal",
    title: "Abdalla Nabulere & 2 Others v. Uganda [1979] HCB 77",
    sub: "Cautionary principles for identification evidence in criminal trials — the foundational Ugandan authority on this question.",
    source: ["Court of Appeal", "1979", "Criminal Law · Evidence"],
  },
  {
    cat: "statutes",
    tag: "Statute",
    title: "The Penal Code Act, Cap. 120",
    sub: "The principal statute defining criminal offences and penalties under Ugandan law. Sections 285 & 286 cover aggravated robbery.",
    source: ["Cap. 120", "In force", "Criminal Law"],
  },
  {
    cat: "statutes",
    tag: "Statute",
    title: "The Constitution of the Republic of Uganda, 1995",
    sub: "The supreme law of Uganda. Establishes fundamental rights, branches of government, and procedures for governance.",
    source: ["1995, as amended", "In force", "Constitutional Law"],
  },
  {
    cat: "statutory-documents",
    tag: "Statutory Document",
    title: "Land Acquisition Act — Statutory Instrument No. 24 of 1965",
    sub: "Procedural framework under the Land Acquisition Act setting out compensation calculations and government acquisition procedures.",
    source: ["SI No. 24 of 1965", "Land Law"],
  },
  {
    cat: "decrees",
    tag: "Decree",
    title: "The Expropriated Properties Act (Cap. 87)",
    sub: "Governs the return or compensation for properties expropriated during the 1972 economic war.",
    source: ["Cap. 87", "Land · Property Law"],
  },
  {
    cat: "legal-notices",
    tag: "Legal Notice",
    title: "Legal Notice No. 1 of 2024 — Amendment of Civil Procedure Rules",
    sub: "Updates to the Civil Procedure Rules procedure for summary judgment applications.",
    source: ["LN 1/2024", "Civil Procedure"],
  },
];

function makeEmptyFilters(): Record<FacetKey, Set<string>> {
  return {
    Year: new Set(),
    "Area of law": new Set(),
    Source: new Set(),
  };
}

export function LibraryView({ initialCategory }: { initialCategory: string }) {
  const [activeCat, setActiveCat] = useState<CategoryId>(initialCategory as CategoryId);
  const [activeFilters, setActiveFilters] =
    useState<Record<FacetKey, Set<string>>>(makeEmptyFilters);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Most recent");

  const catStripRef = useRef<HTMLDivElement | null>(null);
  const catIndicatorRef = useRef<HTMLDivElement | null>(null);
  const catBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [catMeasured, setCatMeasured] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  // Close filter dropdown on outside click + Escape.
  useEffect(() => {
    if (!filterOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!filterMenuRef.current) return;
      if (!filterMenuRef.current.contains(e.target as Node)) {
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

  useLayoutEffect(() => {
    const btn = catBtnRefs.current[activeCat];
    const ind = catIndicatorRef.current;
    if (!btn || !ind) return;
    ind.style.left = `${btn.offsetLeft}px`;
    ind.style.width = `${btn.offsetWidth}px`;
    if (!catMeasured) setCatMeasured(true);
  }, [activeCat, catMeasured]);

  // Available values per facet — derived from items in the active category.
  const facetValues = useMemo(() => {
    const byCat = activeCat === "all" ? RESULTS : RESULTS.filter((r) => r.cat === activeCat);
    const out: Record<FacetKey, string[]> = {
      Year: [],
      "Area of law": [],
      Source: [],
    };
    for (const f of FACETS) {
      const set = new Set<string>();
      for (const r of byCat) {
        for (const v of f.getValues(r)) set.add(v);
      }
      out[f.key] = [...set].sort();
    }
    return out;
  }, [activeCat]);

  const filtered = useMemo(() => {
    let items = activeCat === "all" ? RESULTS : RESULTS.filter((r) => r.cat === activeCat);

    // AND across facets, OR within a facet.
    for (const f of FACETS) {
      const sel = activeFilters[f.key];
      if (sel.size === 0) continue;
      items = items.filter((r) => {
        const vals = f.getValues(r);
        return vals.some((v) => sel.has(v));
      });
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((r) =>
        [r.tag, r.title, r.sub, ...r.source].some((s) => s.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeCat, activeFilters, query]);

  const activeCatMeta = CATEGORIES.find((c) => c.id === activeCat);
  const activeFilterCount = Object.values(activeFilters).reduce(
    (n, s) => n + s.size,
    0
  );

  // Stagger the result cards in whenever the filter set changes.
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

  const toggleFilter = (facet: FacetKey, value: string) => {
    haptic("selection");
    setActiveFilters((prev) => {
      const nextSet = new Set(prev[facet]);
      if (nextSet.has(value)) nextSet.delete(value);
      else nextSet.add(value);
      return { ...prev, [facet]: nextSet };
    });
  };

  const clearFilters = () => {
    haptic("light");
    setActiveFilters(makeEmptyFilters());
  };

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
        <span>Library</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-serif text-h1 sm:text-display font-semibold tracking-tight">
          Library
        </h1>
        <p className="mt-2 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
          Cases, statutes, statutory documents, decrees and legal notices — supporting
          material when you need it.
        </p>
      </header>

      <label
        className="flex items-center gap-3 mb-6 px-4 py-3 sm:px-[18px] sm:py-3.5 transition-all focus-within:[border-color:var(--text-2)] focus-within:shadow-[0_0_0_4px_rgba(15,15,16,0.05)]"
        style={{
          border: "1px solid var(--line-2)",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface)",
        }}
      >
        <SearchIcon
          aria-hidden
          size={18}
          style={{ color: "var(--text-3)", flexShrink: 0 }}
        />
        <input
          type="search"
          placeholder="Search this library…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 outline-none bg-transparent text-base"
          style={{ color: "var(--text)" }}
        />
        <span
          className="hidden sm:inline"
          style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
        >
          {CATEGORIES[0].count.toLocaleString()} items
        </span>
      </label>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6 max-w-full">
      <div
        ref={catStripRef}
        role="tablist"
        className="relative inline-flex items-center gap-0.5 p-1 bg-stone-150 rounded-full max-w-full overflow-x-auto cat-strip-scroll lg:overflow-x-visible"
      >
        {/* Sliding active indicator */}
        <div
          ref={catIndicatorRef}
          aria-hidden
          className={`absolute top-1 bottom-1 rounded-full ${
            catMeasured
              ? "transition-[left,width] duration-300 ease-[var(--ease-out)]"
              : ""
          }`}
          style={{
            left: 0,
            width: 0,
            background: "var(--orange-wash)",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px color-mix(in srgb, var(--orange) 30%, transparent)",
          }}
        />
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = c.id === activeCat;
          return (
            <button
              key={c.id}
              ref={(el) => {
                catBtnRefs.current[c.id] = el;
              }}
              role="tab"
              aria-selected={active}
              onClick={() => {
                haptic("selection");
                setActiveCat(c.id);
              }}
              className={`relative z-10 inline-flex items-center gap-2 rounded-full transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                active
                  ? "font-semibold text-[color:var(--orange-dark)]"
                  : "text-stone-700 font-medium hover:text-stone-900"
              }`}
              style={{
                padding: "9px 14px",
                fontSize: "var(--text-label-sm)",
              }}
            >
              {Icon && <Icon size={14} />}
              {c.label}
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: active
                    ? "color-mix(in srgb, var(--orange) 18%, transparent)"
                    : "var(--surface-2)",
                  color: active ? "var(--orange-dark)" : "var(--text-3)",
                  border: active
                    ? "1px solid color-mix(in srgb, var(--orange) 30%, transparent)"
                    : "1px solid var(--line-2)",
                }}
              >
                {c.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Collapsed Filter button + dropdown */}
          <div ref={filterMenuRef} className="relative">
            <button
              type="button"
              onClick={() => {
                haptic("light");
                setFilterOpen((v) => !v);
              }}
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
                  if (values.length === 0) return null;
                  const selected = activeFilters[facet.key];
                  return (
                    <div key={facet.key} className="mb-4 last:mb-0">
                      <div
                        className="flex items-center justify-between mb-1.5"
                      >
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
                            style={{
                              fontSize: "0.66rem",
                              color: "var(--text-3)",
                            }}
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
                                <span style={{ color: "var(--text)", marginLeft: 8 }} aria-hidden>
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
              <option>Most cited</option>
              <option>A–Z</option>
            </select>
            <ChevronDown
              aria-hidden
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500"
            />
          </div>
        </div>
      </div>

      <div className="mb-3" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}>
        {filtered.length
          ? `Showing ${filtered.length} of ${activeCatMeta?.count.toLocaleString()} items`
          : "No items match this filter."}
      </div>

      <div ref={resultsRef} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => (
          <NoteThumb
            key={`${activeCat}-${i}`}
            href={`/document?file=${encodeURIComponent(CAT_DEFAULT_DOC[r.cat])}`}
            title={r.title}
            code={CAT_SHORT_LABEL[r.cat]}
            meta={r.source[r.source.length - 1]}
            variant={CAT_THUMB_VARIANT[r.cat]}
            style={{ minHeight: 140 }}
          />
        ))}
      </div>
    </>
  );
}
