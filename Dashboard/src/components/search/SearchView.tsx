"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  FileText,
  Gavel,
  Newspaper,
  Scale,
  Search as SearchIcon,
  X,
  type LucideIcon,
} from "lucide-react";

type FilterId = "all" | "notes" | "case-law" | "statutes" | "docs";

const FILTERS: { id: FilterId; label: string; icon: LucideIcon | null }[] = [
  { id: "all", label: "All", icon: null },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "case-law", label: "Case Law", icon: Gavel },
  { id: "statutes", label: "Statutes", icon: Scale },
  { id: "docs", label: "Documents", icon: Newspaper },
];

type SearchResult = {
  type: Exclude<FilterId, "all">;
  icon: LucideIcon;
  tag: string;
  title: string;
  snippet: string;
  source: string[];
  href: string;
};

const RESULTS: SearchResult[] = [
  {
    type: "case-law",
    icon: Gavel,
    tag: "Case · Supreme Court",
    title: "Uganda v. Kato Jonathan (Criminal Appeal No. 14 of 2021)",
    snippet:
      "The judgment reaffirms the duty of a trial court to exercise the greatest caution before convicting on the basis of <mark>identification evidence</mark> given under difficult conditions.",
    source: ["Supreme Court of Uganda", "12 May 2021"],
    href: "/document",
  },
  {
    type: "case-law",
    icon: Gavel,
    tag: "Case · Court of Appeal",
    title: "Abdalla Nabulere & 2 Others v. Uganda [1979] HCB 77",
    snippet:
      "Cautionary principles for <mark>identification evidence</mark> in criminal trials — the foundational Ugandan authority on this question.",
    source: ["Court of Appeal", "1979"],
    href: "/document",
  },
  {
    type: "notes",
    icon: FileText,
    tag: "Note · LAW 1108",
    title: "Criminal Law — Jorvan Notes",
    snippet:
      "Where <mark>identification</mark> rests on a single witness in difficult lighting, the court must look for corroborating evidence before convicting.",
    source: ["Year 1, Sem 1", "Fundamentals of Criminal Law"],
    href: `/document?file=${encodeURIComponent("HTML/YR 1 SEM 1/Criminal Law 1 - jorvannotes.html")}`,
  },
  {
    type: "statutes",
    icon: Scale,
    tag: "Statute",
    title: "The Penal Code Act, Cap. 120 (s. 286)",
    snippet:
      "Aggravated robbery — sections 285 and 286(2). The principal statute referenced in <mark>identification</mark>-based prosecutions for theft with violence.",
    source: ["Cap. 120", "In force"],
    href: "/document",
  },
  {
    type: "notes",
    icon: FileText,
    tag: "Note · LAW 2210",
    title: "Evidence II Notes",
    snippet:
      "Identification parades, dock identification, and the cautionary principles from <mark>Abdalla Nabulere</mark> applied to modern Uganda.",
    source: ["Year 2, Sem 2", "Law of Evidence II"],
    href: `/document?file=${encodeURIComponent("HTML/YR 3 SEM 2/EVIDENCE 2 NOTES-12.html")}`,
  },
  {
    type: "docs",
    icon: Newspaper,
    tag: "Statutory Document",
    title: "Statutory Instrument — Identification Procedures Update (1965 framework)",
    snippet:
      "Procedural updates to the conduct of <mark>identification</mark> parades and the documentation standards required.",
    source: ["SI No. 24 of 1965"],
    href: "/document",
  },
];

const RECENT = [
  { q: "identification evidence", when: "2 hours ago" },
  { q: "mens rea", when: "Yesterday" },
  { q: "land transactions", when: "3 days ago" },
  { q: "Penal Code s. 286", when: "Last week" },
  { q: "privity of contract", when: "Last week" },
];

export function SearchView({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const hasQuery = query.trim().length > 0;

  const filtered = useMemo(() => {
    if (!hasQuery) return [];
    return activeFilter === "all" ? RESULTS : RESULTS.filter((r) => r.type === activeFilter);
  }, [hasQuery, activeFilter]);

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
        <span>Search</span>
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
          Search
        </h1>
        <p className="mt-2 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
          Search across notes, case law, statutes, and statutory documents.
        </p>
      </header>

      <label
        className="flex items-center gap-3.5 mb-6 transition-all focus-within:shadow-[0_0_0_5px_rgba(15,15,16,0.06)]"
        style={{
          padding: "18px 22px",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-xl)",
          background: "var(--surface)",
        }}
      >
        <SearchIcon size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <input
          type="text"
          autoFocus
          placeholder="Search everything — case names, course units, statutes, topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 outline-none bg-transparent"
          style={{ fontSize: "1.1rem", color: "var(--text)" }}
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear"
            className="flex items-center justify-center rounded-full cursor-pointer transition-colors hover:[background:var(--surface-3)] hover:[color:var(--text)]"
            style={{
              width: 28,
              height: 28,
              background: "var(--surface-2)",
              color: "var(--text-2)",
              border: 0,
            }}
          >
            <X size={14} />
          </button>
        )}
      </label>

      {hasQuery ? (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="inline-flex items-center gap-2 cursor-pointer transition-colors"
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    border: `1px solid ${active ? "var(--text)" : "var(--line)"}`,
                    background: active ? "var(--text)" : "var(--surface)",
                    color: active ? "var(--text-inv)" : "var(--text-2)",
                    fontSize: "var(--text-body-sm)",
                    fontWeight: 500,
                  }}
                >
                  {Icon && <Icon size={13} />}
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="mb-3" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}>
            {filtered.length} results for &ldquo;{query}&rdquo;
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map((r, i) => {
              const Icon = r.icon;
              return (
                <Link
                  key={i}
                  href={r.href}
                  className="group grid no-underline text-inherit transition-all hover:-translate-y-0.5"
                  style={{
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 14,
                    padding: "14px 18px",
                    background: "var(--surface)",
                    border: "1px solid var(--line-2)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div
                    className="flex items-center justify-center self-start"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--line-2)",
                      color: "var(--text-2)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="uppercase font-medium mb-1"
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                      }}
                    >
                      {r.tag}
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontSize: "var(--text-label)",
                        fontWeight: 500,
                        lineHeight: 1.35,
                        color: "var(--text)",
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      className="mb-1.5 search-snippet"
                      style={{
                        fontSize: "var(--text-body-sm)",
                        color: "var(--text-2)",
                        lineHeight: 1.55,
                      }}
                      dangerouslySetInnerHTML={{ __html: r.snippet }}
                    />
                    <div
                      className="flex flex-wrap items-center gap-2.5"
                      style={{ fontSize: "var(--text-mono)", color: "var(--text-3)" }}
                    >
                      {r.source.map((s, j) => (
                        <span key={j} className="inline-flex items-center gap-1">
                          {j > 0 && <span style={{ color: "var(--surface-3)" }}>·</span>}
                          <span>{s}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="self-center transition-all group-hover:translate-x-0.5 group-hover:[color:var(--text)]"
                    style={{ color: "var(--text-3)" }}
                  >
                    <ArrowUpRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <Card label="Recent searches" icon={Clock}>
            <div className="flex flex-col">
              {RECENT.map((r) => (
                <button
                  key={r.q}
                  onClick={() => setQuery(r.q)}
                  className="flex items-center gap-2.5 transition-colors cursor-pointer hover:[background:var(--surface-2)] text-left"
                  style={{
                    padding: "9px 6px",
                    borderRadius: "var(--radius-md)",
                    border: 0,
                    background: "transparent",
                    color: "inherit",
                  }}
                >
                  <SearchIcon size={13} style={{ color: "var(--text-3)" }} />
                  <span className="flex-1" style={{ fontSize: "var(--text-body-sm)", color: "var(--text)" }}>
                    {r.q}
                  </span>
                  <span style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}>{r.when}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card label="Search tips" icon={BookOpen}>
            <Tip>
              Use <Code>&quot;</Code> for exact phrases — <strong>&ldquo;due process&rdquo;</strong> finds the phrase, not the words separately.
            </Tip>
            <Tip>
              Filter by year — <strong>year:2</strong> narrows to your Year 2 notes.
            </Tip>
            <Tip>
              Search a course — <strong>law:1108</strong> looks inside Fundamentals of Criminal Law.
            </Tip>
            <Tip>
              Press <Code>⌘K</Code> from anywhere to jump back here.
            </Tip>
          </Card>
        </div>
      )}

      <style>{`
        .search-snippet mark {
          background: rgba(15, 15, 16, 0.1);
          color: var(--text);
          padding: 1px 3px;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}

function Card({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 22px",
      }}
    >
      <div
        className="flex items-center gap-2 mb-3.5 uppercase font-semibold"
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
        }}
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

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.82em",
        padding: "1px 6px",
        borderRadius: "var(--radius-sm)",
        background: "var(--surface)",
        border: "1px solid var(--line-2)",
      }}
    >
      {children}
    </code>
  );
}
