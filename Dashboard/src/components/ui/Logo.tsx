import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center px-2.5 py-1 text-stone-900 no-underline"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sikia-law-logo.svg"
        alt="Sikia Law"
        height={32}
        style={{ height: 32, width: "auto", display: "block" }}
      />
    </Link>
  );
}
