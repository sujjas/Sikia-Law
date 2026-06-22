import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function LibraryTile({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 border border-[var(--line-2)] rounded-lg bg-white text-stone-900 font-sans text-label font-medium no-underline transition-colors duration-150 hover:bg-stone-100"
      style={{
        paddingInline: "var(--lib-px)",
        paddingBlock: "var(--lib-py)",
      }}
    >
      {Icon && (
        <Icon
          aria-hidden
          size={18}
          strokeWidth={1.6}
          className="shrink-0 text-stone-500"
        />
      )}
      {label}
    </Link>
  );
}
