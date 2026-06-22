"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  FileText,
  Sparkles,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { searchNotes, type SearchHit } from "@/lib/search";
import { getAllNotes } from "@/lib/curriculum-lookup";
import { haptic } from "@/lib/haptics";

// Year tabs, derived once from the curriculum.
const YEARS = (() => {
  const seen = new Map<number, string>();
  for (const n of getAllNotes()) if (!seen.has(n.yearNum)) seen.set(n.yearNum, n.yearLabel);
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([num, label]) => ({ num, label }));
})();

const RECENT = ["equity", "identification evidence", "fairness", "criminal law", "natural law"];

export function SearchView({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [yearFilter, setYearFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<{ hits: SearchHit[]; semanticTerms: string[] }>(() =>
    initialQuery.trim() ? searchNotes(initialQuery) : { hits: [], semanticTerms: [] }
  );
  const [shown, setShown] = useState(() => initialQuery.trim().length > 0);

  const hasQuery = query.trim().length > 0;
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search runs from event handlers (typing, recents, clear) — brief loading
  // (skeleton) → results, which then reveal with a stagger.
  const runSearch = (q: string) => {
    setQuery(q);
    setYearFilter("all");
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) {
      setLoading(false);
      setOutcome({ hits: [], semanticTerms: [] });
      setShown(false);
      return;
    }
    setLoading(true);
    setShown(false);
    debounce.current = setTimeout(() => {
      setOutcome(searchNotes(q));
      setLoading(false);
    }, 480);
  };

  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);

  // Trigger the staggered reveal once results land.
  useEffect(() => {
    if (loading || !hasQuery) return;
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [loading, hasQuery, outcome]);

  const hits = useMemo(
    () => (yearFilter === "all" ? outcome.hits : outcome.hits.filter((h) => h.yearNum === yearFilter)),
    [outcome.hits, yearFilter]
  );

  const queryTokens = useMemo(
    () => query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2),
    [query]
  );

  return (
    <>
      <nav
        className="flex items-center gap-1.5 mb-3.5"
        style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
      >
        <Link href="/" className="hover:[color:var(--text)] no-underline">Home</Link>
        <span>/</span>
        <span>Search</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-serif text-h1 sm:text-display font-semibold tracking-tight">Search</h1>
        <p className="mt-2 flex items-center gap-2" style={{ color: "var(--text-2)" }}>
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{ width: 20, height: 20, background: "var(--orange)", color: "#fff", flexShrink: 0 }}
          >
            <Sparkles size={12} strokeWidth={2.3} />
          </span>
          Smart search — finds the right note by meaning, not just exact words.
        </p>
      </header>

      <label
        className="flex items-center gap-3 sm:gap-3.5 mb-6 px-4 py-3 sm:px-[22px] sm:py-[18px] transition-all"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface)",
        }}
      >
        <SearchIcon size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <input
          type="text"
          autoFocus
          placeholder="Try “fairness”, “crime”, “natural law”…"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
          className="flex-1 outline-none bg-transparent text-base sm:text-[1.1rem]"
          style={{ color: "var(--text)" }}
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => runSearch("")}
            aria-label="Clear"
            className="flex items-center justify-center rounded-full cursor-pointer transition-colors hover:[background:var(--surface-3)] hover:[color:var(--text)]"
            style={{ width: 28, height: 28, background: "var(--surface-2)", color: "var(--text-2)", border: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </label>

      {hasQuery ? (
        <>
          <YearTabs years={YEARS} value={yearFilter} onChange={setYearFilter} />

          {loading ? (
            <SkeletonResults />
          ) : (
            <>
              <div
                className="mt-5 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1"
                style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}
              >
                <span>
                  {hits.length} result{hits.length === 1 ? "" : "s"} for &ldquo;{query.trim()}&rdquo;
                </span>
                {outcome.semanticTerms.length > 0 && (
                  <span className="inline-flex items-center gap-1.5" style={{ color: "var(--ai-text)" }}>
                    <Sparkles size={12} strokeWidth={2.3} />
                    also matching {outcome.semanticTerms.slice(0, 3).join(", ")}
                  </span>
                )}
              </div>

              {hits.length === 0 ? (
                <div
                  className="reveal-row is-shown text-center"
                  style={{ padding: "40px 16px", color: "var(--text-3)", fontSize: "var(--text-body-sm)" }}
                >
                  No notes matched that. Try a topic like <b>equity</b>, <b>evidence</b>, or <b>contract</b>.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {hits.map((r, i) => (
                    <Link
                      key={r.href + i}
                      href={r.href}
                      {...(r.hasContent ? {} : { target: "_blank", rel: "noopener" })}
                      className={"reveal-row group grid gap-3 sm:gap-3.5 px-4 py-3 sm:px-[18px] sm:py-3.5 no-underline text-inherit [grid-template-columns:36px_1fr] sm:[grid-template-columns:36px_1fr_auto] hover:-translate-y-0.5" + (shown ? " is-shown" : "")}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--line-2)",
                        borderRadius: "var(--radius-lg)",
                        transitionDelay: shown ? `${Math.min(i, 10) * 40}ms` : "0ms",
                      }}
                    >
                      <div
                        className="flex items-center justify-center self-start"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "var(--radius-md)",
                          background: "var(--orange-wash)",
                          border: "1px solid color-mix(in srgb, var(--orange) 22%, transparent)",
                          color: "var(--orange-dark)",
                        }}
                      >
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="uppercase font-medium mb-1"
                          style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--text-3)" }}
                        >
                          {r.hasContent ? "Note" : "PDF"}
                          {r.courseCode ? ` · ${r.courseCode}` : ""}
                        </div>
                        <div
                          className="mb-1 search-title"
                          style={{ fontSize: "var(--text-label)", fontWeight: 500, lineHeight: 1.35, color: "var(--text)" }}
                        >
                          {highlight(r.title, queryTokens)}
                        </div>
                        <div
                          className="flex flex-wrap items-center gap-2.5"
                          style={{ fontSize: "var(--text-mono)", color: "var(--text-3)" }}
                        >
                          {[r.courseTitle, `${r.yearLabel} · ${r.semesterLabel}`].map((s, j) => (
                            <span key={j} className="inline-flex items-center gap-1">
                              {j > 0 && <span style={{ color: "var(--surface-3)" }}>·</span>}
                              <span>{s}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        className="hidden sm:flex self-center items-center transition-all group-hover:translate-x-0.5 group-hover:[color:var(--text)]"
                        style={{ color: "var(--text-3)" }}
                      >
                        <ArrowUpRight size={16} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:[grid-template-columns:1.2fr_1fr]">
          <Card label="Recent searches" icon={Clock}>
            <div className="flex flex-col">
              {RECENT.map((q) => (
                <button
                  key={q}
                  onClick={() => { haptic("selection"); runSearch(q); }}
                  className="flex items-center gap-2.5 transition-colors cursor-pointer hover:[background:var(--surface-2)] text-left"
                  style={{ padding: "9px 6px", borderRadius: "var(--radius-md)", border: 0, background: "transparent", color: "inherit" }}
                >
                  <SearchIcon size={13} style={{ color: "var(--text-3)" }} />
                  <span className="flex-1" style={{ fontSize: "var(--text-body-sm)", color: "var(--text)" }}>{q}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card label="How smart search works" icon={BookOpen}>
            <Tip>Search by <strong>meaning</strong> — &ldquo;fairness&rdquo; surfaces <strong>Equity &amp; Trusts</strong>, &ldquo;crime&rdquo; surfaces <strong>Criminal Law</strong>.</Tip>
            <Tip>Searches across <strong>every note</strong> in the curriculum, by title, course, year and semester.</Tip>
            <Tip>Filter results to your <strong>year</strong> with the tabs once you&apos;ve searched.</Tip>
          </Card>
        </div>
      )}

      <style>{`
        .search-title mark { background: var(--orange-wash); color: var(--orange-dark); padding: 0 3px; border-radius: 3px; font-weight: 700; }
      `}</style>
    </>
  );
}

/** Sliding segmented control (transitions.dev #16). */
function YearTabs({
  years,
  value,
  onChange,
}: {
  years: { num: number; label: string }[];
  value: number | "all";
  onChange: (v: number | "all") => void;
}) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  const moveTo = (animate: boolean) => {
    const bar = barRef.current;
    const pill = pillRef.current;
    if (!bar || !pill) return;
    const active = bar.querySelector('[aria-selected="true"]') as HTMLElement | null;
    if (!active) return;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
    }
  };

  useEffect(() => {
    moveTo(true);
  }, [value]);
  useEffect(() => {
    const id = requestAnimationFrame(() => moveTo(false));
    const onResize = () => moveTo(false);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const tabs: { key: number | "all"; label: string }[] = [
    { key: "all", label: "All" },
    ...years.map((y) => ({ key: y.num, label: y.label })),
  ];

  return (
    <div className="t-tabs" role="tablist" ref={barRef}>
      <span className="t-tabs-pill" aria-hidden ref={pillRef} />
      {tabs.map((t) => (
        <button
          key={String(t.key)}
          className="t-tab"
          role="tab"
          aria-selected={value === t.key}
          onClick={() => { haptic("selection"); onChange(t.key); }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SkeletonResults() {
  return (
    <div className="mt-5 flex flex-col gap-2" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-3.5 px-4 py-3 sm:px-[18px] sm:py-3.5 [grid-template-columns:36px_1fr]"
          style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-lg)" }}
        >
          <div className="skel-bar" style={{ width: 36, height: 36, borderRadius: "var(--radius-md)" }} />
          <div className="flex flex-col gap-2 py-0.5">
            <div className="skel-bar" style={{ width: "30%", height: 9 }} />
            <div className="skel-bar" style={{ width: "70%", height: 13 }} />
            <div className="skel-bar" style={{ width: "45%", height: 9 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Wrap query tokens in <mark> within a title. */
function highlight(text: string, tokens: string[]) {
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.map(escapeRe).join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) =>
    tokens.some((t) => p.toLowerCase() === t.toLowerCase()) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>
  );
}
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Card({ label, icon: Icon, children }: { label: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line-2)", borderRadius: "var(--radius-lg)", padding: "20px 22px" }}>
      <div
        className="flex items-center gap-2 mb-3.5 uppercase font-semibold"
        style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--text-3)" }}
      >
        <Icon size={13} style={{ color: "var(--text-2)" }} />
        {label}
      </div>
      {children}
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-2"
      style={{
        padding: "12px 14px",
        background: "var(--bg)",
        border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-body-sm)",
        color: "var(--text-2)",
      }}
    >
      {children}
    </div>
  );
}
