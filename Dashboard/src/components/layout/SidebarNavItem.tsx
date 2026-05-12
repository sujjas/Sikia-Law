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
  registerRef,
  onItemEnter,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  active?: boolean;
  /** Lets the parent Sidebar measure this item for the sliding indicator. */
  registerRef?: (el: HTMLAnchorElement | null) => void;
  /** Fired when the cursor enters this item — parent slides the indicator. */
  onItemEnter?: () => void;
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

      // Only play after the user has genuinely moved their cursor. This
      // avoids the synthetic mouseenter that fires when the nav item
      // mounts beneath a stationary cursor right after a click → navigate.
      const mountedAt = performance.now();
      let pressing = false;

      const onDown = () => {
        pressing = true;
      };
      const onUp = () => {
        pressing = false;
      };

      const onEnter = contextSafe(() => {
        if (pressing) return;
        if (performance.now() - mountedAt < 300) return;
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

        // Scale pop — slightly more prominent.
        tl.to(
          icon,
          {
            keyframes: [
              { scale: 1.42, duration: 0.19, ease: "back.out(2.8)" },
              { scale: 1.12, duration: 0.2,  ease: "power2.inOut" },
              { scale: 1.0,  duration: 0.16, ease: "power2.out" },
            ],
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
          scale: 1,
          duration: 0.2,
          overwrite: true,
        });
      });

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);
      link.addEventListener("mousedown", onDown);
      link.addEventListener("mouseup", onUp);

      return () => {
        link.removeEventListener("mouseenter", onEnter);
        link.removeEventListener("mouseleave", onLeave);
        link.removeEventListener("mousedown", onDown);
        link.removeEventListener("mouseup", onUp);
      };
    },
    { scope: linkRef }
  );

  return (
    <Link
      ref={(el) => {
        linkRef.current = el;
        registerRef?.(el);
      }}
      href={href}
      onMouseEnter={onItemEnter}
      aria-current={active ? "page" : undefined}
      className={`relative z-10 flex items-center rounded-md font-sans text-label no-underline transition-colors ${
        active
          ? "bg-stone-100 text-stone-900 font-semibold ring-1 ring-black/[0.04]"
          : "text-stone-600 font-medium hover:text-stone-900"
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
