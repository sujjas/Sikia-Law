"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { haptic } from "@/lib/haptics";
import {
  findDemoBank,
  matchDemoQA,
  meaningfulHeadings,
  resolveDemoSources,
  KIND_LABEL,
  type AskHeading,
  type Source,
} from "@/lib/ask-demo";

export type { AskHeading } from "@/lib/ask-demo";
import {
  Sparkles,
  X,
  ArrowUp,
  Square,
  Check,
  Copy,
  FileX2,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  sources: Source[];
  followups: string[];
  refusal: boolean;
  streaming: boolean;
};

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  noteTitle: string;
  headings: AskHeading[];
  hasContent: boolean;
  /** Bounding rect of the launcher button, captured at open time. On desktop
   *  the panel morphs out of (and back into) this rect via GSAP. */
  originRect: Rect | null;
  /** Scroll the reader to a heading; returns nothing. On mobile the caller
   *  should also close the sheet so the prose is visible. */
  onCite: (id: string) => void;
  onClose: () => void;
};


const SCOPE_BLOCKERS = [
  "kenya", "tanzania", "rwanda", "nigeria", "south africa", "england", "british",
  "united states", "u.s.", "american", "india", "australia", "canada", "eu law",
  "my case", "my landlord", "should i sue", "sue my", "my divorce", "my contract",
  "tax advice", "medical", "real lawyer", "represent me", "file a case for me",
];

/** Placeholder Ugandan authorities surfaced alongside the note's own sections.
 *  Until the Library is wired (see CLAUDE.md, "Cited references" rail), these
 *  stand in so the typed source list — note sections + external authorities —
 *  can be reviewed end to end. */
const LIBRARY_SOURCES: Source[] = [
  {
    id: "lib-const-1995",
    kind: "statute",
    title: "Constitution of Uganda 1995",
    meta: "The supreme law — the starting point for most questions.",
  },
  {
    id: "lib-saved-notes",
    kind: "note",
    title: "Your saved notes",
    meta: "Related material you've bookmarked in this course.",
  },
];

/** Mock answer engine — there is no backend in this prototype. It fabricates a
 *  believable, citation-first response grounded in the note's own headings so
 *  the UX of "Ask this note" can be reviewed end to end. */
function buildAnswer(
  query: string,
  noteTitle: string,
  headings: AskHeading[]
): { text: string; sources: Source[]; followups: string[]; refusal: boolean } {
  const q = query.toLowerCase().trim();

  // Guardrail: scope is locked to this note + Ugandan law.
  if (SCOPE_BLOCKERS.some((k) => q.includes(k))) {
    return {
      refusal: true,
      sources: [],
      followups: [],
      text:
        "I can only answer from this note and Ugandan law — I can't speak to other jurisdictions or give personal legal advice.\n\nTry rephrasing your question so it's about the material in this note, and I'll point you to the exact section.",
    };
  }

  // Curated demo answer for showcase notes — believable, hand-authored, cited.
  // Falls through to the generic engine for notes/questions without an entry.
  const bank = findDemoBank(noteTitle);
  if (bank) {
    const qa = matchDemoQA(bank, query);
    if (qa) {
      return {
        text: qa.answer,
        sources: resolveDemoSources(qa.sources, headings),
        followups: qa.followups,
        refusal: false,
      };
    }
  }

  // Only cite meaningful section headings (see meaningfulHeadings).
  const usable = meaningfulHeadings(headings);
  const pool = usable.length ? usable : headings;

  // Guardrail: "I don't know" is allowed rather than inventing an answer.
  if (pool.length === 0) {
    return {
      refusal: true,
      sources: [],
      followups: [],
      text:
        "I don't have enough structure in this note to answer confidently, and I won't guess. If you can point me to a specific passage, I'll work from that.",
    };
  }

  const isSummary = /summar|tl;?dr|overview|gist|brief/.test(q);
  const isDefine = /^(what is|define|meaning of|what does)\b/.test(q);

  // For a summary the relevant anchors are the document's leading sections, not
  // whatever happens to share a word with the query. Otherwise, rank by overlap
  // against the query minus generic/stop words.
  const STOP = new Set([
    "this", "that", "note", "notes", "what", "which", "does", "about", "here",
    "main", "principle", "principles", "explain", "summarise", "summarize",
    "summary", "give", "tell", "show", "with", "from", "into", "they", "their",
  ]);
  let picked: AskHeading[];
  if (isSummary) {
    picked = pool.slice(0, 2);
  } else {
    const words = new Set(
      q.split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !STOP.has(w))
    );
    const scored = pool
      .map((h) => {
        const ht = h.text.toLowerCase();
        let score = 0;
        words.forEach((w) => {
          if (ht.includes(w)) score += 1;
        });
        return { h, score };
      })
      .sort((a, b) => b.score - a.score);
    const top = scored.filter((s) => s.score > 0).slice(0, 2);
    picked = (top.length ? top : scored.slice(0, 2)).map((s) => s.h);
  }

  const first = picked[0]?.text ?? noteTitle;
  const second = picked[1]?.text;

  let text: string;
  if (isSummary) {
    text =
      `In short, **${noteTitle}** builds its argument around **${first}**` +
      (second ? `, then develops it through **${second}**.` : ".") +
      `\n\nThe key takeaway for revision: focus on how the principle is established and the conditions under which it applies. Skim the surrounding sections for the supporting authorities.`;
  } else if (isDefine) {
    text =
      `Within this note, the term is treated under **${first}**.\n\n` +
      `Put plainly: it is the legal principle the section sets out, framed in the Ugandan context this note covers. The section gives you the working definition plus the authority it rests on — use that wording in an exam answer.`;
  } else {
    text =
      `Based on this note, the answer turns on **${first}**.\n\n` +
      (second
        ? `That section lays out the rule, and **${second}** shows how it's applied. `
        : `That section sets out the rule and the reasoning behind it. `) +
      `I'd read those passages directly before relying on this — the citations below jump you straight there.`;
  }

  // The note's own sections come first (real, navigable), then the external
  // authorities. They share one typed list under "Sources".
  const sectionSources: Source[] = picked.map((h) => ({
    id: h.id,
    kind: "section",
    title: h.text,
    meta: "Cited section in this note.",
  }));
  const sources: Source[] = [...sectionSources, ...LIBRARY_SOURCES];

  // Suggest two next questions, steering toward sections we didn't just cite.
  const pickedIds = new Set(picked.map((h) => h.id));
  const rest = pool.filter((h) => !pickedIds.has(h.id));
  const followups = [
    rest[0] ? `Explain "${rest[0].text}"` : `Summarise ${noteTitle}`,
    "How might this come up in an exam?",
  ];

  return { text, sources, followups, refusal: false };
}

let MSG_ID = 0;

export function AskPanel({ noteTitle, headings, hasContent, originRect, onCite, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolved once: desktop morphs via GSAP, mobile uses the CSS bottom sheet.
  const isDesktopRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );
  const reducedRef = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // The launcher rect to morph out of / back into. Falls back to a pill near
  // the bottom-right corner if we weren't handed one.
  const resolveOrigin = useCallback((): Rect => {
    if (originRect) return originRect;
    return { top: window.innerHeight - 72, left: window.innerWidth - 188, width: 156, height: 46 };
  }, [originRect]);

  // Anchor the transform at the launcher: returns a "Xpx Ypx" transform-origin
  // (relative to the panel's own box) pointing at the launcher's centre, so the
  // panel scales out of / back into the button (Emil: origin-aware popovers).
  const launcherOrigin = useCallback(
    (panel: HTMLElement): string => {
      gsap.set(panel, { clearProps: "transform" }); // measure at full size
      const pr = panel.getBoundingClientRect();
      const o = resolveOrigin();
      const ox = o.left + o.width / 2 - pr.left;
      const oy = o.top + o.height / 2 - pr.top;
      return `${ox}px ${oy}px`;
    },
    [resolveOrigin]
  );

  // Desktop open: origin-aware scale + fade — a subtle 0.96 → 1 from the
  // launcher corner. Quiet, fast, GPU. Plain effect (not useGSAP) so it's
  // deterministic under React's dev double-invoke.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !isDesktopRef.current) return; // mobile → CSS sheet
    if (reducedRef.current) {
      gsap.set(backdropRef.current, { autoAlpha: 1 });
      return;
    }
    gsap.set(panel, { transformOrigin: launcherOrigin(panel), scale: 0.96, opacity: 0 });
    gsap.set(backdropRef.current, { autoAlpha: 0 });
    const tl = gsap
      .timeline()
      .to(backdropRef.current, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, 0)
      .to(panel, { scale: 1, opacity: 1, duration: 0.24, ease: "power3.out" }, 0);
    return () => { tl.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streaming = messages.some((m) => m.streaming);
  const busy = thinking || streaming;

  // Autoscroll as content grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, thinking]);

  // Play the exit animation, then unmount once it has finished. Desktop morphs
  // the panel back into the launcher rect with GSAP; mobile uses the CSS sheet.
  const closingRef = useRef(false);
  const requestClose = useCallback(
    (after?: () => void) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const panel = panelRef.current;
      document.documentElement.classList.remove("ask-sheet-open");

      // Reduced motion: no movement animation, just leave.
      if (reducedRef.current) {
        onClose();
        after?.();
        return;
      }

      if (isDesktopRef.current && panel) {
        // Desktop: fade + shrink back toward the launcher (origin persists from
        // open). Exit is quicker than the entrance.
        gsap.killTweensOf([panel, backdropRef.current]);
        gsap
          .timeline({ onComplete: () => { onClose(); after?.(); } })
          .to(panel, { scale: 0.96, opacity: 0, duration: 0.16, ease: "power2.out" }, 0)
          .to(backdropRef.current, { autoAlpha: 0, duration: 0.18, ease: "power1.out" }, 0);
      } else {
        // Mobile sheet: slide down from wherever it is (rest or a drag position)
        // with the iOS drawer curve. CSS transition → interruptible + GPU.
        if (panel) {
          panel.style.transition = "transform 0.3s var(--ease-drawer)";
          panel.style.transform = "translateY(100%)";
        }
        if (backdropRef.current) {
          backdropRef.current.style.transition = "opacity 0.28s ease";
          backdropRef.current.style.opacity = "0";
        }
        window.setTimeout(() => { onClose(); after?.(); }, 290);
      }
    },
    [onClose]
  );

  // Focus the composer on open + Esc to close.
  useEffect(() => {
    taRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  // Citation click: on the mobile drawer, close first so the prose is visible,
  // then scroll. On desktop the panel is docked beside the prose — scroll live.
  const onCiteClick = useCallback(
    (id: string) => {
      haptic("selection");
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        requestClose(() => onCite(id));
      } else {
        onCite(id);
      }
    },
    [requestClose, onCite]
  );

  // Background scaling (Vaul-style) — push the page behind back while the mobile
  // sheet is up. Toggled via a class on <html>; CSS does the transition.
  useEffect(() => {
    if (isDesktopRef.current || reducedRef.current) return;
    const html = document.documentElement;
    html.classList.add("ask-sheet-open");
    return () => html.classList.remove("ask-sheet-open");
  }, []);

  // Size the mobile sheet from the visual viewport. iOS Safari does NOT honor
  // interactive-widget=resizes-content, so when the keyboard opens we shrink the
  // sheet to the still-visible area (composer ends up just above the keyboard)
  // instead of letting it overflow off-screen.
  useEffect(() => {
    const panel = panelRef.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (isDesktopRef.current || !panel || !vv) return;
    const apply = () => {
      const peek = Math.round(vv.height * 0.08); // small gap showing the page behind
      panel.style.top = `${Math.max(0, vv.offsetTop) + peek}px`;
      panel.style.height = `${vv.height - peek}px`;
      panel.style.bottom = "auto";
    };
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
    };
  }, []);

  // Velocity-aware drag-to-dismiss for the mobile sheet. Drag from the grab
  // handle / header; flick down or pull past ~28% to dismiss, else snap back.
  // Dragging up past the top meets resistance (damping) rather than a hard stop.
  const drag = useRef<{ startY: number; t: number; dy: number; active: boolean } | null>(null);
  const onDragStart = useCallback((e: React.PointerEvent) => {
    if (isDesktopRef.current) return;
    if ((e.target as HTMLElement).closest("button")) return; // let header buttons click
    const panel = panelRef.current;
    if (!panel) return;
    drag.current = { startY: e.clientY, t: performance.now(), dy: 0, active: true };
    panel.style.transition = "none";
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);
  const onDragMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d?.active || !panel) return;
    let dy = e.clientY - d.startY;
    if (dy < 0) dy = -Math.pow(-dy, 0.78); // resistance dragging up past the top
    d.dy = dy;
    panel.style.transform = `translateY(${dy}px)`;
    if (backdropRef.current && dy > 0) {
      const h = panel.offsetHeight || 1;
      backdropRef.current.style.opacity = String(Math.max(0.2, 1 - (dy / h) * 0.85));
    }
  }, []);
  const onDragEnd = useCallback(() => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d?.active || !panel) return;
    d.active = false;
    drag.current = null;
    const h = panel.offsetHeight || 1;
    const velocity = d.dy / Math.max(1, performance.now() - d.t); // px/ms, +down
    if (d.dy > h * 0.28 || velocity > 0.4) {
      requestClose(); // slides from the current drag position to fully closed
    } else {
      // Snap back with the drawer curve.
      panel.style.transition = "transform 0.34s var(--ease-drawer)";
      panel.style.transform = "translateY(0px)";
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 0.34s ease";
        backdropRef.current.style.opacity = "";
      }
    }
  }, [requestClose]);
  const dragHandlers = {
    onPointerDown: onDragStart,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerCancel: onDragEnd,
  };

  // Clear any running timers on unmount.
  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
    };
  }, []);

  const stopStreaming = useCallback(() => {
    haptic("light");
    if (streamTimer.current) {
      clearInterval(streamTimer.current);
      streamTimer.current = null;
    }
    if (thinkTimer.current) {
      clearTimeout(thinkTimer.current);
      thinkTimer.current = null;
    }
    setThinking(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  }, []);

  const streamAnswer = useCallback(
    (query: string) => {
      const { text, sources, followups, refusal } = buildAnswer(query, noteTitle, headings);
      setThinking(true);
      // brief "reading the note" beat before the answer streams in
      thinkTimer.current = setTimeout(() => {
        setThinking(false);
        const aiId = ++MSG_ID;
        setMessages((prev) => [
          ...prev,
          { id: aiId, role: "ai", text: "", sources, followups, refusal, streaming: true },
        ]);
        const tokens = text.split(/(\s+)/); // keep whitespace for natural cadence
        let i = 0;
        streamTimer.current = setInterval(() => {
          i += 2;
          const partial = tokens.slice(0, i).join("");
          const done = i >= tokens.length;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId ? { ...m, text: done ? text : partial, streaming: !done } : m
            )
          );
          if (done && streamTimer.current) {
            clearInterval(streamTimer.current);
            streamTimer.current = null;
          }
        }, 42);
      }, 620);
    },
    [noteTitle, headings]
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || busy || !hasContent) return;
      haptic("light");
      setInput("");
      // Reset the grown textarea and, on mobile, drop focus so the keyboard
      // collapses and the full sheet comes back into view.
      if (taRef.current) {
        taRef.current.style.height = "auto";
        if (typeof window !== "undefined" && window.innerWidth < 1024) taRef.current.blur();
      }
      setMessages((prev) => [
        ...prev,
        { id: ++MSG_ID, role: "user", text, sources: [], followups: [], refusal: false, streaming: false },
      ]);
      streamAnswer(text);
    },
    [busy, hasContent, streamAnswer]
  );

  const copy = useCallback((m: Message) => {
    haptic("selection");
    navigator.clipboard?.writeText(m.text.replace(/\*\*/g, "")).then(() => {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 1400);
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 132) + "px";
  };

  const demoBank = findDemoBank(noteTitle);
  const niceHeading = meaningfulHeadings(headings)[0];
  const suggestions = !hasContent
    ? []
    : demoBank
    ? demoBank.starters
    : [
        "Summarise this note",
        niceHeading ? `Explain "${niceHeading.text}"` : "What are the key points?",
        "What are the main legal principles here?",
      ];

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        ref={backdropRef}
        className="ask-backdrop"
        onClick={() => requestClose()}
        aria-hidden
      />
      <aside
        ref={panelRef}
        className="ask-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Ask this note — Sikia AI"
      >
        <span className="ask-grabber" aria-hidden {...dragHandlers} />

        {/* Header */}
        <header className="ask-head" {...dragHandlers}>
          <span className="ask-orb" data-thinking={thinking || undefined} aria-hidden>
            <Sparkles size={16} strokeWidth={2.2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="ask-head__title">Ask this note</div>
            <div className="ask-head__scope">
              <span className="ask-head__scope-label">Sikia AI · scoped to</span>
              <b title={noteTitle}>{noteTitle}</b>
            </div>
          </div>
          <button className="ask-iconbtn" onClick={() => requestClose()} aria-label="Close" title="Close (Esc)">
            <X size={17} />
          </button>
        </header>

        {/* Body */}
        <div className="ask-body" ref={bodyRef}>
          {!hasContent ? (
            <div className="ask-unavailable">
              <span className="ask-unavailable__icon" aria-hidden>
                <FileX2 size={20} />
              </span>
              <div className="ask-unavailable__title">I can&apos;t read this note yet</div>
              <p className="ask-unavailable__body">
                There&apos;s no extracted text for this document, so I have nothing to ground an
                answer in. Open a note marked <b>Note</b> and I&apos;ll be able to help.
              </p>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="ask-empty">
                  <p className="ask-empty__lede">
                    Ask anything about <b>{noteTitle}</b>. Every answer cites the section it came
                    from, and I&apos;ll say so if it&apos;s not in this note.
                  </p>
                  <div className="ask-suggests">
                    {suggestions.map((s) => (
                      <button key={s} className="ask-suggest" onClick={() => send(s)}>
                        <Sparkles size={15} strokeWidth={2.2} />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="ask-msg ask-msg--user">
                    <div className="ask-bubble-user">{m.text}</div>
                  </div>
                ) : (
                  <div key={m.id} className="ask-msg">
                    <div className="ask-ai">
                      <span className="ask-ai__avatar" aria-hidden>
                        <Sparkles size={14} strokeWidth={2.2} />
                      </span>
                      <div className={"ask-ai__content" + (m.refusal ? " is-refusal" : "")}>
                        {renderRichText(m.text)}

                        {!m.streaming && m.sources.length > 0 && (
                          <div className="ask-sources">
                            <div className="ask-sources__strip">
                              {m.sources.map((s) =>
                                s.kind === "section" ? (
                                  <button
                                    key={s.id}
                                    className="ask-source"
                                    onClick={() => onCiteClick(s.id)}
                                    title={`Jump to “${s.title}”`}
                                  >
                                    <span className="ask-source__type" data-kind={s.kind}>
                                      {KIND_LABEL[s.kind]}
                                    </span>
                                    <span className="ask-source__title">{s.title}</span>
                                    <span className="ask-source__meta">{s.meta}</span>
                                  </button>
                                ) : (
                                  <div key={s.id} className="ask-source ask-source--static">
                                    <span className="ask-source__type" data-kind={s.kind}>
                                      {KIND_LABEL[s.kind]}
                                    </span>
                                    <span className="ask-source__title">{s.title}</span>
                                    <span className="ask-source__meta">{s.meta}</span>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="ask-sources__count">Sources · {m.sources.length}</div>
                          </div>
                        )}

                        {!m.streaming && !m.refusal && (
                          <div className="ask-ai__actions">
                            <button className="ask-ai__action" onClick={() => copy(m)}>
                              {copiedId === m.id ? <Check size={13} /> : <Copy size={13} />}
                              {copiedId === m.id ? "Copied" : "Copy"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <div className="ask-msg">
                  <div className="ask-ai">
                    <span className="ask-ai__avatar" aria-hidden>
                      <Sparkles size={14} strokeWidth={2.2} />
                    </span>
                    <div className="ask-ai__content" style={{ flex: 1 }}>
                      <span className="t-shimmer" data-text="Reading this note…">
                        Reading this note…
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </>
          )}
        </div>

        {/* Suggested follow-ups — pinned above the composer, tracking the
            latest answer so they're always one tap away. */}
        {(() => {
          if (!hasContent || thinking) return null;
          const lastAi = [...messages]
            .reverse()
            .find((m) => m.role === "ai" && !m.streaming && !m.refusal);
          if (!lastAi || lastAi.followups.length === 0) return null;
          return (
            <div className="ask-followups">
              {lastAi.followups.map((f) => (
                <button key={f} className="ask-followup" onClick={() => send(f)} disabled={busy}>
                  {f}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Composer */}
        <footer className="ask-foot">
          <div className="ask-composer">
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              disabled={!hasContent}
              placeholder={hasContent ? "Ask about this note…" : "Unavailable for this note"}
              aria-label="Ask a question about this note"
            />
            {streaming ? (
              <button className="ask-send ask-send--stop" onClick={stopStreaming} aria-label="Stop generating" title="Stop">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                className="ask-send"
                onClick={() => send(input)}
                disabled={!input.trim() || busy || !hasContent}
                aria-label="Send"
                title="Send (Enter)"
              >
                <ArrowUp size={18} strokeWidth={2.4} />
              </button>
            )}
          </div>
          <p className="ask-disclaimer">
            {hasContent
              ? "Sikia AI can be wrong — always check the cited section."
              : "This note has no readable text for the AI."}
          </p>
        </footer>
      </aside>
    </>,
    document.body
  );
}

/** Minimal inline renderer: paragraphs split on blank lines, **bold** spans. */
function renderRichText(text: string) {
  if (!text) return null;
  return text.split(/\n\n+/).map((para, pi) => (
    <p key={pi}>
      {para.split(/(\*\*[^*]+\*\*)/).map((chunk, ci) =>
        chunk.startsWith("**") && chunk.endsWith("**") ? (
          <strong key={ci}>{chunk.slice(2, -2)}</strong>
        ) : (
          <span key={ci}>{chunk}</span>
        )
      )}
    </p>
  ));
}
