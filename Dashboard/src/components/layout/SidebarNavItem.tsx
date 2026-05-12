"use client";

import Link from "next/link";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CountBadge } from "@/components/ui/Badge";

gsap.registerPlugin(DrawSVGPlugin);

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  count,
  active = false,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  active?: boolean;
}) {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const iconRef = useRef<SVGSVGElement | null>(null);

  useGSAP(
    (_, contextSafe) => {
      const link = linkRef.current;
      const icon = iconRef.current;
      if (!link || !icon || !contextSafe) return;

      const strokes = icon.querySelectorAll<SVGGeometryElement>(
        "path, line, polyline, polygon, circle, ellipse, rect"
      );
      if (strokes.length === 0) return;

      // Pivot for the post-draw shake.
      gsap.set(icon, { transformOrigin: "50% 50%" });

      const onEnter = contextSafe(() => {
        const tl = gsap.timeline({ overwrite: "auto" });

        // Draw outward from the midpoint of each stroke.
        tl.fromTo(
          strokes,
          { drawSVG: "50% 50%" },
          {
            drawSVG: "0% 100%",
            duration: 0.55,
            ease: "power2.inOut",
            stagger: 0.04,
          },
          0
        );

        // Subtle shake riding alongside the draw — same start, same end.
        tl.to(
          icon,
          {
            keyframes: [
              { rotation: 2 },
              { rotation: -2 },
              { rotation: 1.2 },
              { rotation: -0.6 },
              { rotation: 0 },
            ],
            duration: 0.55,
            ease: "power1.inOut",
          },
          0
        );
      });

      const onLeave = contextSafe(() => {
        // Snap everything back to the resting state.
        gsap.to(strokes, {
          drawSVG: "0% 100%",
          duration: 0.18,
          overwrite: true,
        });
        gsap.to(icon, {
          rotation: 0,
          duration: 0.2,
          overwrite: true,
        });
      });

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);

      return () => {
        link.removeEventListener("mouseenter", onEnter);
        link.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope: linkRef }
  );

  return (
    <Link
      ref={linkRef}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center rounded-md font-sans text-label no-underline transition-colors ${
        active
          ? "bg-stone-100 text-stone-900 font-semibold ring-1 ring-black/[0.04]"
          : "text-stone-600 font-medium hover:bg-stone-50 hover:text-stone-900 active:bg-stone-100"
      }`}
      style={{
        paddingInline: "var(--nav-item-px)",
        paddingBlock: "var(--nav-item-py)",
        gap: "var(--nav-item-gap)",
      }}
    >
      {Icon && (
        <Icon
          ref={iconRef}
          aria-hidden
          size={18}
          strokeWidth={1.6}
          className={`shrink-0 ${active ? "text-stone-900" : "text-stone-500"}`}
        />
      )}
      <span className="flex-1">{label}</span>
      {count !== undefined && <CountBadge count={count} />}
    </Link>
  );
}
