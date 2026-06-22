"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, FolderOpen, MoreHorizontal, Palette } from "lucide-react";

export type FolderVariant =
  | "amber"
  | "orange"
  | "rose"
  | "pink"
  | "fuchsia"
  | "violet"
  | "indigo"
  | "sky"
  | "teal"
  | "emerald"
  | "black";

export const FOLDER_VARIANTS: FolderVariant[] = [
  "orange",
  "amber",
  "rose",
  "pink",
  "fuchsia",
  "violet",
  "indigo",
  "sky",
  "teal",
  "emerald",
  "black",
];

/* Representative swatch colour for the per-folder colour picker. */
export const VARIANT_SWATCH: { variant: FolderVariant; color: string }[] = [
  { variant: "orange", color: "#C9790A" },
  { variant: "amber", color: "#F59E0B" },
  { variant: "rose", color: "#F43F5E" },
  { variant: "pink", color: "#EC4899" },
  { variant: "fuchsia", color: "#D946EF" },
  { variant: "violet", color: "#8B5CF6" },
  { variant: "indigo", color: "#6366F1" },
  { variant: "sky", color: "#0EA5E9" },
  { variant: "teal", color: "#14B8A6" },
  { variant: "emerald", color: "#10B981" },
  { variant: "black", color: "#1c1c1c" },
];

const PAPER_LINES = Array.from({ length: 13 });

export function Folder({
  href,
  title,
  subtitle,
  count,
  countLabel = "Notes",
  variant = "orange",
  ariaLabel,
}: {
  href: string;
  title: string;
  subtitle: string;
  count: number;
  countLabel?: string;
  variant?: FolderVariant;
  ariaLabel?: string;
}) {
  // Folder colour is user-customisable via the ⋯ menu (demo state).
  const [color, setColor] = useState<FolderVariant>(variant);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSwatches, setShowSwatches] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowSwatches(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="relative" ref={wrapRef}>
      <Link
        href={href}
        className={`folder-card folder-card--${color}`}
        aria-label={ariaLabel ?? `Open ${title}`}
      >
        <div className="folder-card__top">
          <div className="folder-card__cover">
            <div className="folder-card__papers">
              <div className="folder-card__paper folder-card__paper--1" />
              <div className="folder-card__paper folder-card__paper--2" />
              <div className="folder-card__paper folder-card__paper--3">
                <div className="folder-card__lines">
                  {PAPER_LINES.map((_, i) => (
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
              <div className="folder-card__title truncate">{title}</div>
              <div className="folder-card__subtitle truncate">{subtitle}</div>
            </div>
            {/* Spacer keeps the title clear of the ⋯ button overlaid below. */}
            <span className="w-4 flex-shrink-0" aria-hidden="true" />
          </div>
          <div className="folder-card__count">
            {count} {count === 1 ? countLabel.replace(/s$/, "") : countLabel}
          </div>
        </div>
      </Link>

      {/* ⋯ menu trigger — sibling to the Link so it isn't a nested anchor. */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen((v) => !v);
          setShowSwatches(false);
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`${title} folder options`}
        className="absolute z-10 flex items-center justify-center cursor-pointer transition-colors"
        style={{
          top: 150,
          right: 12,
          width: 26,
          height: 26,
          borderRadius: 7,
          background: menuOpen ? "rgba(255,255,255,0.22)" : "transparent",
          border: 0,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute z-20"
          style={{
            top: 180,
            right: 12,
            minWidth: 184,
            padding: 6,
            background: "var(--surface)",
            border: "1px solid var(--line-2)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-3)",
          }}
        >
          <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-2.5 no-underline"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              color: "var(--text-2)",
              fontSize: "var(--text-body-sm)",
            }}
          >
            <FolderOpen size={15} /> Open folder
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => setShowSwatches((v) => !v)}
            aria-expanded={showSwatches}
            className="flex items-center gap-2.5 w-full text-left cursor-pointer"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              background: showSwatches ? "var(--surface-2)" : "transparent",
              border: 0,
              color: "var(--text-2)",
              fontSize: "var(--text-body-sm)",
            }}
          >
            <Palette size={15} /> Change colour
          </button>

          {showSwatches && (
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                padding: "8px 6px 4px",
              }}
            >
              {VARIANT_SWATCH.map((s) => {
                const active = s.variant === color;
                return (
                  <button
                    key={s.variant}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    aria-label={s.variant}
                    onClick={() => {
                      setColor(s.variant);
                      closeMenu();
                    }}
                    className="flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: s.color,
                      border: 0,
                      boxShadow: active
                        ? "0 0 0 2px var(--surface), 0 0 0 4px var(--text)"
                        : "0 0 0 1px rgba(0,0,0,0.06) inset",
                    }}
                  >
                    {active && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
