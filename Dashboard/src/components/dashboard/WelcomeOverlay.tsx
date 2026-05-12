"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Folder as FolderCard,
  type FolderVariant,
} from "@/components/dashboard/Folder";

const YEAR_VARIANTS: FolderVariant[] = ["orange", "petrol", "forest", "indigo"];

const STORAGE_KEY = "sikia-welcome-seen";

export function WelcomeOverlay({
  yearCounts,
}: {
  /** Total notes per year (1-indexed key), used as the count on each folder. */
  yearCounts?: Record<number, number>;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  // Open on first mount unless previously dismissed.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  // Lock body scroll + Escape-to-close while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setClosing(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // no-op
    }
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 240);
  }

  if (!open) return null;

  return (
    <div
      className={`welcome-backdrop${closing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="welcome-modal">
        <button
          type="button"
          className="welcome-close"
          aria-label="Close"
          onClick={close}
        >
          <X size={16} />
        </button>

        <div className="welcome-art" aria-hidden>
          <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
            <circle
              cx="46"
              cy="46"
              r="44"
              fill="var(--surface-2)"
              stroke="var(--line-2)"
              strokeWidth="1"
            />
            <g transform="rotate(-7 46 46)">
              <rect
                x="24"
                y="26"
                width="40"
                height="48"
                rx="3"
                fill="var(--surface)"
                stroke="var(--text-2)"
                strokeWidth="1.5"
              />
              <line x1="30" y1="36" x2="58" y2="36" stroke="var(--text-3)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="30" y1="42" x2="52" y2="42" stroke="var(--text-3)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="30" y1="48" x2="58" y2="48" stroke="var(--text-3)" strokeWidth="1.2" strokeLinecap="round" />
            </g>
            <rect
              x="28"
              y="22"
              width="40"
              height="48"
              rx="3"
              fill="var(--surface)"
              stroke="var(--text)"
              strokeWidth="1.5"
            />
            <line x1="34" y1="32" x2="60" y2="32" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="38" x2="54" y2="38" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="44" x2="60" y2="44" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="50" x2="48" y2="50" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="56" x2="58" y2="56" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="34" y1="62" x2="44" y2="62" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 id="welcome-title" className="font-serif">
          Welcome to Sikia Law
        </h2>

        <p className="welcome-lede">
          Direct access to{" "}
          <Link
            href="/notes"
            style={{
              color: "var(--text)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            structured, peer-reviewed law study notes
          </Link>{" "}
          and resources — built for students at every stage of their education,
          alongside legal practitioners and the curious. Sikia Law is your study
          partner: understand legal principles, stay aligned with your syllabus,
          and prepare confidently for exams.
        </p>

        <div className="welcome-section-label">Browse notes by year</div>
        <div className="welcome-years">
          {[1, 2, 3, 4].map((y, i) => (
            <div
              key={y}
              onClick={() => {
                try {
                  localStorage.setItem(STORAGE_KEY, "1");
                } catch {}
              }}
            >
              <FolderCard
                href={`/notes?year=${y}`}
                title={`Year ${y}`}
                subtitle="Browse course units"
                count={yearCounts?.[y] ?? 0}
                countLabel="Notes"
                variant={YEAR_VARIANTS[i % YEAR_VARIANTS.length]}
              />
            </div>
          ))}
        </div>

        <p className="welcome-note">
          Our{" "}
          <Link
            href="/notes"
            style={{
              color: "var(--text)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
            onClick={() => {
              try {
                localStorage.setItem(STORAGE_KEY, "1");
              } catch {}
            }}
          >
            Course Outline
          </Link>{" "}
          may vary slightly from your university&rsquo;s. If you don&rsquo;t
          find a subject under a particular year, please explore the others —
          it may be taught at a different stage.
        </p>

        <div className="welcome-actions">
          <Link href="/search" className="welcome-link">
            <Search size={14} /> Keyword search
          </Link>
          <Link href="/library" className="welcome-link">
            <BookOpen size={14} /> Reading list
          </Link>
          <Link href="/library" className="welcome-link">
            <FileText size={14} /> Study resources
          </Link>
        </div>

        <Button variant="primary" className="w-full" onClick={close}>
          Continue to dashboard
        </Button>
      </div>
    </div>
  );
}
