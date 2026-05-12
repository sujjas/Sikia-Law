import Link from "next/link";
import { ProgressFill } from "@/components/ui/ProgressFill";

export type NoteThumbVariant =
  | "orange"
  | "petrol"
  | "forest"
  | "rose"
  | "indigo";

export function NoteThumb({
  href,
  title,
  course,
  code,
  meta,
  progress,
  variant = "orange",
  external = false,
  className: extraClassName,
  style,
}: {
  href: string;
  title: string;
  /** Optional small course label shown under the title. */
  course?: string;
  /** Course code (or short tag) for the colored pill at the top. */
  code?: string;
  /** Tail meta — e.g. "PDF" or "Lecture note". */
  meta?: string;
  /** 0–100; when set, renders a thin progress bar at the bottom. */
  progress?: number;
  variant?: NoteThumbVariant;
  external?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const className = `note-thumb note-thumb--sheet note-thumb--${variant}${
    extraClassName ? ` ${extraClassName}` : ""
  }`;
  const pct = typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : null;
  const content = (
    <>
      {code && <span className="note-thumb__tab">{code}</span>}
      <div className="note-thumb__body">
        <div className="note-thumb__title">{title}</div>
        {(course || meta) && (
          <div className="note-thumb__meta">
            {course && <span>{course}</span>}
            {course && meta && <span>·</span>}
            {meta && <span>{meta}</span>}
          </div>
        )}
      </div>
      {pct !== null && (
        <div className="note-thumb__progress" aria-label={`${pct}% read`}>
          <div className="note-thumb__progress-track">
            <ProgressFill percent={pct} className="note-thumb__progress-fill" />
          </div>
          <span className="note-thumb__progress-value">{pct}%</span>
        </div>
      )}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className} style={style}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {content}
    </Link>
  );
}

const VARIANT_CYCLE: NoteThumbVariant[] = ["orange", "petrol", "forest", "rose", "indigo"];

export function noteThumbVariantFor(i: number): NoteThumbVariant {
  return VARIANT_CYCLE[i % VARIANT_CYCLE.length];
}
