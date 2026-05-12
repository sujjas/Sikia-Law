import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "brand" | "petrol" | "danger";
type Size = "sm" | "md";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-stone-900 text-white border-transparent hover:bg-stone-700",
  secondary: "bg-white text-stone-900 border-[var(--line)] hover:border-stone-900",
  ghost:
    "bg-transparent text-stone-600 border-transparent hover:bg-stone-100 hover:text-stone-900",
  brand:
    "bg-orange-500 text-stone-900 border-transparent font-semibold hover:bg-orange-600 active:bg-orange-700",
  petrol:
    "bg-petrol-500 text-white border-transparent hover:bg-petrol-600 active:bg-petrol-700",
  danger:
    "bg-white text-rust-dark border-[var(--color-rust-wash)] hover:bg-[var(--color-rust-wash)]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-label-sm",
  md: "px-[18px] py-2.5 text-label",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps =
  | (Common & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
  | (Common & { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>);

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md border font-sans font-medium tracking-[-0.005em] cursor-pointer no-underline transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] active:translate-y-px focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,149,1,0.32)] disabled:opacity-50 disabled:cursor-not-allowed";

export function Button(props: ButtonProps) {
  const { variant = "secondary", size = "md", className = "", children } = props;
  const cls = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } =
    props as Common & { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
