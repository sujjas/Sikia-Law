"use client";

import Link from "next/link";
import { Search, House, FileText, Library, Bookmark } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { SidebarNavItem } from "./SidebarNavItem";

type ActiveKey = "search" | "home" | "notes" | "library" | "bookmarks" | "profile";

export function Sidebar({
  active,
  user,
}: {
  active: ActiveKey;
  user: { initials: string; name: string; meta: string };
}) {
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

      <nav className="flex flex-col gap-0.5">
        <SidebarNavItem href="/search" label="Search" icon={Search} active={active === "search"} />
        <SidebarNavItem href="/" label="Home" icon={House} active={active === "home"} />
        <SidebarNavItem href="/notes" label="Notes" icon={FileText} count={87} active={active === "notes"} />
        <SidebarNavItem href="/library" label="Library" icon={Library} active={active === "library"} />
        <SidebarNavItem href="/bookmarks" label="Bookmarks" icon={Bookmark} count={12} active={active === "bookmarks"} />
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
