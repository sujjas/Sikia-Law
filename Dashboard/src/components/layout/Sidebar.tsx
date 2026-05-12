"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Search, House, FileText, Library, Bookmark } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { SidebarNavItem } from "./SidebarNavItem";

type ActiveKey = "search" | "home" | "notes" | "library" | "bookmarks" | "profile";

type NavKey = Exclude<ActiveKey, "profile">;

const NAV_ITEMS: { key: NavKey; href: string; label: string; icon: typeof Search; count?: number }[] = [
  { key: "search",    href: "/search",    label: "Search",    icon: Search },
  { key: "home",      href: "/",          label: "Home",      icon: House },
  { key: "notes",     href: "/notes",     label: "Notes",     icon: FileText, count: 87 },
  { key: "library",   href: "/library",   label: "Library",   icon: Library },
  { key: "bookmarks", href: "/bookmarks", label: "Bookmarks", icon: Bookmark, count: 12 },
];

export function Sidebar({
  active,
  user,
}: {
  active: ActiveKey;
  user: { initials: string; name: string; meta: string };
}) {
  const navRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<NavKey, HTMLAnchorElement | null>>({
    search: null,
    home: null,
    notes: null,
    library: null,
    bookmarks: null,
  });
  const [hovered, setHovered] = useState<NavKey | null>(null);
  const [measured, setMeasured] = useState(false);

  const navKey: NavKey | null = active === "profile" ? null : active;

  // The hover indicator floats around — it's only visible while the cursor
  // is over the nav (and isn't over the active item, since that one already
  // has its own pressed-state background).
  useLayoutEffect(() => {
    const ind = indicatorRef.current;
    const nav = navRef.current;
    if (!ind || !nav) return;

    if (!hovered || hovered === navKey) {
      ind.style.opacity = "0";
      return;
    }
    const el = itemRefs.current[hovered];
    if (!el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const inset = 6;
    ind.style.transform = `translateY(${elRect.top - navRect.top + inset}px)`;
    ind.style.height = `${elRect.height - inset * 2}px`;
    ind.style.opacity = "1";
    if (!measured) setMeasured(true);
  }, [hovered, navKey, measured]);

  return (
    <aside
      className="bg-white border-r border-[var(--line-2)] sticky top-0 h-screen flex flex-col"
      style={{
        paddingInline: "var(--sidebar-px)",
        paddingTop: "var(--sidebar-pt)",
        paddingBottom: "var(--sidebar-pb)",
      }}
    >
      <div style={{ marginBottom: "var(--sidebar-logo-mb)" }}>
        <Logo />
      </div>

      <nav
        ref={navRef}
        className="relative flex flex-col gap-0.5"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Small floating hover indicator — slides between non-active items */}
        <div
          ref={indicatorRef}
          aria-hidden
          className={`absolute left-1.5 right-1.5 top-0 rounded-md bg-stone-50 ring-1 ring-black/[0.03] pointer-events-none ${
            measured ? "transition-[transform,height,opacity] duration-250 ease-[var(--ease-out)]" : ""
          }`}
          style={{ transform: "translateY(0px)", height: 0, opacity: 0 }}
        />
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.key}
            href={item.href}
            label={item.label}
            icon={item.icon}
            count={item.count}
            active={active === item.key}
            registerRef={(el) => {
              itemRefs.current[item.key] = el;
            }}
            onItemEnter={() => setHovered(item.key)}
          />
        ))}
      </nav>

      <Link
        href="/profile"
        className="mt-auto flex items-center gap-3 rounded-md no-underline text-stone-900 hover:bg-stone-100 transition-colors"
        style={{
          paddingInline: "var(--sidebar-foot-px)",
          paddingBlock: "var(--sidebar-foot-pt)",
        }}
      >
        <Avatar initials={user.initials} />
        <div className="min-w-0">
          <div className="font-sans text-label font-semibold leading-tight text-stone-900">
            {user.name}
          </div>
          <div className="font-sans text-mono text-stone-500 mt-0.5">
            {user.meta}
          </div>
        </div>
      </Link>
    </aside>
  );
}
