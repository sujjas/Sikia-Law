"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronRight, ChevronLeft } from "lucide-react";
import type { Note } from "@/data/curriculum";

type Breadcrumb = {
  yearLabel: string;
  semesterLabel: string;
  courseCode: string | null;
  courseTitle: string;
  noteTitle: string;
};

type Props = {
  breadcrumb: Breadcrumb;
  noteTitle: string;
  noteKind: "Note" | "PDF";
  courseCode: string | null;
  courseTitle: string;
  yearLabel: string;
  semesterLabel: string;
  html: string | null;
  prev: Note | null;
  next: Note | null;
  related: Note[];
};

const SMALL_WORDS = new Set([
  "a","an","the","of","in","on","at","to","for","but","by","with","and","or","as","is","it",
  "if","from","than","that","vs","v","via","per","onto","into","upon","off","out","up","down",
]);

function smartTitleCase(str: string): string {
  const trimmed = str.trim();
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (!letters || letters !== letters.toUpperCase()) return str;
  const tokens = trimmed.split(/(\s+)/);
  const wordCount = tokens.filter((t) => t.trim().length).length;
  let wordIdx = 0;
  return tokens
    .map((tok) => {
      if (!tok.trim()) return tok;
      const isFirst = wordIdx === 0;
      const isLast = wordIdx === wordCount - 1;
      wordIdx++;
      const lower = tok.toLowerCase();
      const core = lower.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
      if (!isFirst && !isLast && SMALL_WORDS.has(core)) return lower;
      return lower.replace(/([a-z])/, (m) => m.toUpperCase());
    })
    .join("");
}

function slugify(str: string, used: Set<string>): string {
  const base =
    str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
  let s = base;
  let n = 1;
  while (used.has(s)) {
    n++;
    s = `${base}-${n}`;
  }
  used.add(s);
  return s;
}

type Heading = { id: string; text: string; level: "h2" | "h3" | "h4" };

export function DocumentReader({
  breadcrumb,
  noteTitle,
  noteKind,
  courseCode,
  courseTitle,
  yearLabel,
  semesterLabel,
  html,
  prev,
  next,
  related,
}: Props) {
  const proseRef = useRef<HTMLElement | null>(null);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = proseRef.current;
    if (!root || !html) return;

    // 1) Title-case ALL-CAPS leaf headings.
    root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
      if (h.children.length === 0) {
        const original = h.textContent || "";
        const converted = smartTitleCase(original);
        if (converted !== original) h.textContent = converted;
      }
    });

    // 2) Merge soft-break paragraphs (those not ending in sentence-final punctuation).
    Array.from(root.querySelectorAll("p")).forEach((p) => {
      if (!p.parentNode) return;
      let nxt = p.nextElementSibling;
      while (nxt && nxt.tagName === "P") {
        const txt = (p.textContent || "").replace(/[\s ]+$/, "");
        if (!txt) break;
        const last = txt.slice(-1);
        if (/[.?!:;)"\]]/.test(last)) break;
        const cur = p.innerHTML.replace(/\s+$/, "");
        const more = nxt.innerHTML.replace(/^\s+/, "");
        p.innerHTML = cur + " " + more;
        const toRemove = nxt;
        nxt = nxt.nextElementSibling;
        toRemove.remove();
      }
    });

    // 3) Collect headings + assign ids.
    const used = new Set<string>();
    const collected: Heading[] = [];
    root.querySelectorAll("h2, h3, h4").forEach((h) => {
      const text = (h.textContent || "").trim();
      if (!text) return;
      if (!h.id || used.has(h.id)) h.id = slugify(text, used);
      else used.add(h.id);
      collected.push({
        id: h.id,
        text,
        level: h.tagName.toLowerCase() as "h2" | "h3" | "h4",
      });
    });
    setHeadings(collected);

    // 4) Scrollspy.
    if (!collected.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    collected.forEach((h) => {
      const el = root.querySelector(`#${CSS.escape(h.id)}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [html]);

  const onTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const root = proseRef.current;
    if (!root) return;
    const target = root.querySelector(`#${CSS.escape(id)}`) as HTMLElement | null;
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    }
  };

  const meta = useMemo(() => {
    const items: string[] = [];
    if (courseCode) items.push(courseCode);
    items.push(courseTitle);
    items.push(`${yearLabel} · ${semesterLabel}`);
    return items;
  }, [courseCode, courseTitle, yearLabel, semesterLabel]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 transition-all hover:gap-2.5"
          style={{
            color: "var(--text-2)",
            fontSize: "var(--text-label-sm)",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Back to Notes
        </Link>
      </div>

      <div
        className="grid items-start"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 56,
        }}
      >
        <div className="min-w-0" style={{ maxWidth: 720 }}>
          <nav
            className="flex items-center gap-1.5 flex-wrap mb-4"
            style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
          >
            <Link href="/" className="hover:[color:var(--text)]">Home</Link>
            <span>/</span>
            <Link href="/notes" className="hover:[color:var(--text)]">Notes</Link>
            <span>/</span>
            <span>{breadcrumb.yearLabel}</span>
            <span>/</span>
            <span>{breadcrumb.semesterLabel}</span>
            <span>/</span>
            <span style={{ color: "var(--text-2)" }}>
              {breadcrumb.courseCode ? `${breadcrumb.courseCode} — ` : ""}
              {breadcrumb.courseTitle}
            </span>
          </nav>

          <span
            className="inline-flex items-center mb-4 uppercase font-medium"
            style={{
              padding: "5px 14px",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--text-meta)",
              letterSpacing: "0.1em",
              color: "var(--text-2)",
              background: "var(--surface)",
            }}
          >
            {noteKind}
          </span>

          <h1
            className="font-bold mb-4"
            style={{
              fontSize: "var(--text-display)",
              lineHeight: "var(--text-display--line-height)",
              letterSpacing: "var(--text-display--letter-spacing)",
              color: "var(--text)",
            }}
          >
            {noteTitle}
          </h1>

          <div
            className="flex flex-wrap mb-8 pb-5"
            style={{
              gap: "14px 24px",
              color: "var(--text-2)",
              fontSize: "var(--text-body-sm)",
              borderBottom: "1px solid var(--line-2)",
            }}
          >
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="inline-block rounded-full"
                    style={{ width: 4, height: 4, background: "var(--surface-3)" }}
                  />
                )}
                {m}
              </span>
            ))}
          </div>

          {html ? (
            <article
              ref={proseRef}
              className="doc-prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div
              className="py-16 text-center"
              style={{ color: "var(--text-3)", fontSize: "var(--text-body-sm)" }}
            >
              No extracted content found for this note.
            </div>
          )}

          <nav
            className="grid mt-16 pt-7"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              borderTop: "1px solid var(--line-2)",
            }}
          >
            <FootNavCard direction="prev" note={prev} />
            <FootNavCard direction="next" note={next} />
          </nav>
        </div>

        <aside
          className="flex flex-col gap-3.5 self-start sticky"
          style={{ top: 22, maxHeight: "calc(100vh - 44px)", overflowY: "auto" }}
        >
          <RailCard label="In this note">
            {headings.length === 0 ? (
              <div
                className="text-center"
                style={{ padding: 10, color: "var(--text-3)", fontSize: "var(--text-body-sm)" }}
              >
                No sections detected.
              </div>
            ) : (
              <div className="flex flex-col" style={{ gap: 1 }}>
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => onTocClick(e, h.id)}
                    className="transition-colors"
                    style={{
                      display: "block",
                      padding: "7px 10px",
                      paddingLeft: h.level === "h3" ? 22 : h.level === "h4" ? 32 : 10,
                      fontSize:
                        h.level === "h2" ? "var(--text-body-sm)" : h.level === "h3" ? "0.82rem" : "0.78rem",
                      color: activeId === h.id ? "var(--text)" : h.level === "h2" ? "var(--text-2)" : "var(--text-3)",
                      borderRadius: "var(--radius-md)",
                      background: activeId === h.id ? "var(--surface-2)" : "transparent",
                      fontWeight: activeId === h.id ? 600 : 400,
                      textDecoration: "none",
                      lineHeight: 1.4,
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            )}
          </RailCard>

          <RailCard label="Other notes in this course">
            {related.length === 0 ? (
              <div
                style={{
                  padding: 10,
                  color: "var(--text-3)",
                  fontSize: "var(--text-body-sm)",
                  fontStyle: "italic",
                }}
              >
                —
              </div>
            ) : (
              <div className="flex flex-col">
                {related.map((n, i) => (
                  <Link
                    key={i}
                    href={
                      n.html_file
                        ? `/document?file=${encodeURIComponent(n.html_file)}`
                        : `/Notes/${n.file}`
                    }
                    {...(n.html_file ? {} : { target: "_blank", rel: "noopener" })}
                    className="transition-colors"
                    style={{
                      display: "block",
                      padding: "9px 10px",
                      borderRadius: "var(--radius-md)",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "var(--text-body-sm)",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        color: "var(--text)",
                      }}
                    >
                      {n.title}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </RailCard>
        </aside>
      </div>
    </>
  );
}

function RailCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 14px",
      }}
    >
      <div
        className="uppercase font-semibold"
        style={{
          fontSize: "0.66rem",
          letterSpacing: "0.14em",
          color: "var(--text-3)",
          padding: "0 4px 12px",
          marginBottom: 6,
          borderBottom: "1px solid var(--line-2)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function FootNavCard({ direction, note }: { direction: "prev" | "next"; note: Note | null }) {
  const disabled = !note;
  const isNext = direction === "next";
  const href = note?.html_file
    ? `/document?file=${encodeURIComponent(note.html_file)}`
    : note?.file
    ? `/Notes/${note.file}`
    : "#";

  const inner = (
    <>
      <div
        className="flex items-center gap-1.5 uppercase"
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.12em",
          color: "var(--text-3)",
          justifyContent: isNext ? "flex-end" : "flex-start",
        }}
      >
        {!isNext && <ChevronLeft size={12} />}
        {isNext ? "Next in this course" : "Previous in this course"}
        {isNext && <ChevronRight size={12} />}
      </div>
      <div
        style={{
          fontSize: "var(--text-body-sm)",
          fontWeight: 500,
          lineHeight: 1.3,
          textAlign: isNext ? "right" : "left",
        }}
      >
        {note?.title ?? (isNext ? "No next note" : "No previous note")}
      </div>
    </>
  );

  const baseStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: "16px 18px",
    border: "1px solid var(--line-2)",
    borderRadius: "var(--radius-lg)",
    background: "var(--surface)",
    textDecoration: "none",
    color: "inherit",
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? "none" : "auto",
  };

  if (disabled) {
    return <div style={baseStyle}>{inner}</div>;
  }
  return (
    <Link
      href={href}
      style={baseStyle}
      className="transition-transform hover:-translate-y-0.5 hover:border-[color:var(--text-3)]"
    >
      {inner}
    </Link>
  );
}
