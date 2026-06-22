import Link from "next/link";

export function LinkPill({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-baseline gap-1.5 font-sans text-label-sm font-medium text-stone-600 no-underline transition-[gap,color] duration-150 hover:text-stone-900 hover:gap-2"
    >
      {children}
      <span aria-hidden className="transition-transform">→</span>
    </Link>
  );
}
