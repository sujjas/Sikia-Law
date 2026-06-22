import Link from "next/link";
import { ProgressThin } from "@/components/ui/ProgressThin";

export function ContinueCard({
  href,
  meta,
  title,
  course,
  progress,
}: {
  href: string;
  meta: string;
  title: string;
  course: string;
  progress: number;
}) {
  return (
    <Link
      href={href}
      className="group bg-white border border-[var(--line-2)] rounded-lg no-underline text-stone-900 flex flex-col gap-3 transition-[border-color,transform] duration-150 hover:border-stone-900 hover:-translate-y-0.5"
      style={{
        paddingInline: "var(--card-px)",
        paddingTop: "var(--card-pt)",
        paddingBottom: "var(--card-pb)",
        minHeight: "var(--card-min-h)",
      }}
    >
      <div className="font-sans text-label-sm font-medium text-stone-500">
        {meta}
      </div>
      <div className="font-serif text-h3 font-medium text-stone-900">
        {title}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 font-sans text-meta text-stone-500 font-medium">
        <ProgressThin value={progress} />
        <span className="font-mono text-mono tabular-nums">{course}</span>
      </div>
    </Link>
  );
}
