"use client";

import { useCallback, useRef, useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";
import {
  findDemoBank,
  buildNoteSummary,
  resolveDemoSources,
  KIND_LABEL,
  type AskHeading,
  type Source,
} from "@/lib/ask-demo";

type Props = {
  noteTitle: string;
  headings: AskHeading[];
  hasContent: boolean;
  onCite: (id: string) => void;
};

type Status = "idle" | "loading" | "open";

/** Inline, one-tap summary at the top of the reader. Reuses the AI surface and
 *  the same cited-source pattern as the chat. Curated for showcase notes;
 *  falls back to a heading-derived summary otherwise. */
export function SummaryCard({ noteTitle, headings, hasContent, onCite }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const summary =
    status === "open"
      ? findDemoBank(noteTitle)?.summary ?? buildNoteSummary(noteTitle, headings)
      : null;
  const sources: Source[] = summary ? resolveDemoSources(summary.sources, headings) : [];

  const summarise = useCallback(() => {
    haptic("light");
    setStatus("loading");
    timer.current = setTimeout(() => setStatus("open"), 650);
  }, []);

  const collapse = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setStatus("idle");
  }, []);

  const copy = () => {
    if (!summary) return;
    haptic("selection");
    const plain = [summary.tldr, ...summary.points].map((t) => t.replace(/\*\*/g, "")).join("\n");
    navigator.clipboard?.writeText(plain).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  if (!hasContent) return null;

  if (status !== "open") {
    const loading = status === "loading";
    return (
      <div className="note-summary">
        <button className="note-summary__trigger" onClick={summarise} disabled={loading}>
          <span className="note-summary__spark" data-thinking={loading || undefined} aria-hidden>
            <Sparkles size={15} strokeWidth={2.2} />
          </span>
          {loading ? (
            <span className="note-summary__trigger-text t-shimmer" data-text="Summarising…">
              Summarising…
            </span>
          ) : (
            <span className="note-summary__trigger-text">Summarise this note</span>
          )}
          {!loading && <span className="note-summary__hint">One-tap TL;DR</span>}
          {!loading && <ChevronDown size={16} className="note-summary__chev" />}
        </button>
      </div>
    );
  }

  return (
    <div className="note-summary is-open">
      <div className="note-summary__head">
        <span className="note-summary__spark" aria-hidden>
          <Sparkles size={14} strokeWidth={2.2} />
        </span>
        <span className="note-summary__label">AI Summary</span>
        <div className="note-summary__head-actions">
          <button className="note-summary__act" onClick={copy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="note-summary__act" onClick={collapse}>
            <ChevronUp size={14} /> Hide
          </button>
        </div>
      </div>

      <p className="note-summary__tldr">{rich(summary!.tldr)}</p>

      <ul className="note-summary__points">
        {summary!.points.map((p, i) => (
          <li key={i}>{rich(p)}</li>
        ))}
      </ul>

      {sources.length > 0 && (
        <div className="ask-sources">
          <div className="ask-sources__strip">
            {sources.map((s) =>
              s.kind === "section" ? (
                <button
                  key={s.id}
                  className="ask-source"
                  onClick={() => { haptic("selection"); onCite(s.id); }}
                  title={`Jump to “${s.title}”`}
                >
                  <span className="ask-source__type" data-kind={s.kind}>{KIND_LABEL[s.kind]}</span>
                  <span className="ask-source__title">{s.title}</span>
                  <span className="ask-source__meta">{s.meta}</span>
                </button>
              ) : (
                <div key={s.id} className="ask-source ask-source--static">
                  <span className="ask-source__type" data-kind={s.kind}>{KIND_LABEL[s.kind]}</span>
                  <span className="ask-source__title">{s.title}</span>
                  <span className="ask-source__meta">{s.meta}</span>
                </div>
              )
            )}
          </div>
          <div className="ask-sources__count">Sources · {sources.length}</div>
        </div>
      )}

      <p className="note-summary__disclaimer">AI summary · always check the cited sections.</p>
    </div>
  );
}

/** Tiny inline **bold** renderer. */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i}>{chunk.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}
