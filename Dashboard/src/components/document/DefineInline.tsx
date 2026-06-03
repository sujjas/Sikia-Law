"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { lookupDefinition, type Definition } from "@/lib/ask-demo";

type Props = {
  /** The prose container to watch for selections. */
  proseRef: React.RefObject<HTMLElement | null>;
};

type Anchor = { x: number; y: number };
type State =
  | { phase: "idle" }
  | { phase: "offer"; term: string; at: Anchor }
  | { phase: "loading"; at: Anchor }
  | { phase: "pop"; def: Definition; at: Anchor };

/** Select a legal term in the reader → a "Define" affordance → a plain-English
 *  definition popover (AI surface). Curated glossary; honest fallback for terms
 *  with no entry. No API. */
export function DefineInline({ proseRef }: Props) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setState({ phase: "idle" });
  }, []);

  // Detect a selection inside the prose and place the Define affordance.
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return;

    const onUp = () => {
      window.setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
        const text = sel.toString().trim();
        if (!text) return;
        const range = sel.getRangeAt(0);
        if (!root.contains(range.commonAncestorContainer)) return; // only in the prose
        if (text.split(/\s+/).length > 6 || text.length > 60) return; // not a term
        const r = range.getBoundingClientRect();
        if (!r.width && !r.height) return;
        setState({ phase: "offer", term: text, at: { x: r.left + r.width / 2, y: r.top } });
      }, 10);
    };

    root.addEventListener("mouseup", onUp);
    root.addEventListener("touchend", onUp);
    return () => {
      root.removeEventListener("mouseup", onUp);
      root.removeEventListener("touchend", onUp);
    };
  }, [proseRef]);

  // Dismiss on Esc, scroll, or a click that isn't on our UI.
  useEffect(() => {
    if (state.phase === "idle") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clearAll();
    const onScroll = () => clearAll();
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".define-affordance") || t.closest(".define-pop")) return;
      clearAll();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onDocDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDocDown);
    };
  }, [state.phase, clearAll]);

  const define = useCallback(() => {
    if (state.phase !== "offer") return;
    const { term, at } = state;
    setState({ phase: "loading", at });
    timer.current = setTimeout(() => {
      const def = lookupDefinition(term);
      setState(def ? { phase: "pop", def, at } : { phase: "idle" });
    }, 460);
  }, [state]);

  if (typeof document === "undefined" || state.phase === "idle") return null;

  // Clamp horizontally so the floating UI stays on screen.
  const clampX = (x: number, w: number) =>
    Math.max(12 + w / 2, Math.min(x, window.innerWidth - 12 - w / 2));

  return createPortal(
    <>
      {state.phase === "offer" && (
        <button
          className="define-affordance"
          style={{ left: clampX(state.at.x, 96), top: state.at.y - 44 }}
          onMouseDown={(e) => e.preventDefault()} // keep the text selection alive
          onClick={define}
        >
          <Sparkles size={13} strokeWidth={2.3} />
          Define
        </button>
      )}

      {state.phase === "loading" && (
        <div
          className="define-pop define-pop--loading"
          style={{ left: clampX(state.at.x, 220), top: state.at.y + 14 }}
        >
          <span className="define-pop__spark" aria-hidden>
            <Sparkles size={12} strokeWidth={2.4} />
          </span>
          <span className="t-shimmer" data-text="Defining…">Defining…</span>
        </div>
      )}

      {state.phase === "pop" && (
        <div
          className="define-pop"
          role="dialog"
          aria-label={`Definition of ${state.def.term}`}
          style={{ left: clampX(state.at.x, 300), top: state.at.y + 14 }}
        >
          <div className="define-pop__head">
            <span className="define-pop__spark" aria-hidden>
              <Sparkles size={12} strokeWidth={2.4} />
            </span>
            <span className="define-pop__term">{state.def.term}</span>
          </div>
          {state.def.unknown ? (
            <p className="define-pop__def define-pop__def--muted">
              No glossary entry for this yet — try selecting a single legal term (a doctrine, or a
              single word).
            </p>
          ) : (
            <>
              <p className="define-pop__def">{state.def.plain}</p>
              {state.def.authority && <p className="define-pop__src">{state.def.authority}</p>}
            </>
          )}
        </div>
      )}
    </>,
    document.body
  );
}
