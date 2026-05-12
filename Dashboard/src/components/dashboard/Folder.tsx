import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export type FolderVariant = "orange" | "petrol" | "forest" | "rose" | "blue" | "indigo";

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
  return (
    <Link
      href={href}
      className={`folder-card folder-card--${variant}`}
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
          <MoreHorizontal
            size={16}
            className="text-white/80 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
        </div>
        <div className="folder-card__count">
          {count} {count === 1 ? countLabel.replace(/s$/, "") : countLabel}
        </div>
      </div>
    </Link>
  );
}
