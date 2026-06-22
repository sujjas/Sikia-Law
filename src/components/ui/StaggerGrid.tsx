"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * A simple grid container that fades + slides its immediate children
 * upward on mount, with a small stagger between each item.
 */
export function StaggerGrid({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      gsap.from(root.children, {
        opacity: 0,
        y: 8,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
