import Link from "next/link";

export function CourseTile({
  href,
  code,
  title,
  count,
}: {
  href: string;
  code: string;
  title: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[var(--line-2)] rounded-lg no-underline text-stone-900 flex flex-col gap-2 transition-[border-color,transform] duration-150 hover:border-stone-900 hover:-translate-y-px"
      style={{
        paddingInline: "var(--tile-px)",
        paddingBlock: "var(--tile-py)",
        minHeight: "var(--tile-min-h)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-mono text-stone-500 font-medium tabular-nums">
          {code}
        </span>
        <span className="font-sans text-mono-sm text-stone-600 font-semibold px-2 py-px rounded-full bg-stone-100 whitespace-nowrap">
          {count} {count === 1 ? "note" : "notes"}
        </span>
      </div>
      <div className="font-serif text-h4 font-medium text-stone-900">
        {title}
      </div>
    </Link>
  );
}
