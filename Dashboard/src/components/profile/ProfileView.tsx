"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Camera,
  GraduationCap,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

type SectionId = "profile" | "academics" | "notifications" | "activity" | "account";

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "academics", label: "Academics", icon: GraduationCap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "activity", label: "Activity", icon: BarChart3 },
  { id: "account", label: "Account", icon: Settings },
];

const ELECTIVES = [
  "Constitutional Law",
  "Criminal Law",
  "Land Law",
  "International Law",
  "Human Rights",
  "Family Law",
  "Tax",
  "Intellectual Property",
];

const STATS = [
  { label: "Notes opened", value: "142", sub: "all-time" },
  { label: "This week", value: "23", sub: "+6 vs last week" },
  { label: "Reading streak", value: "5 days", sub: "current" },
  { label: "Time on Sikia Law", value: "8h 24m", sub: "this week" },
  { label: "Bookmarks", value: "12", sub: "across 3 folders" },
  { label: "Year 2 progress", value: "64%", sub: "14 of 22 courses" },
];

export function ProfileView() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [year, setYear] = useState(2);
  const [sem, setSem] = useState(1);
  const [electives, setElectives] = useState<Set<string>>(
    new Set(["Constitutional Law", "Criminal Law", "Family Law"])
  );
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    digest: true,
    newNotes: true,
    newCases: false,
    reminders: true,
  });

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id as SectionId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: "smooth" });
    }
  };

  const toggleElective = (name: string) =>
    setElectives((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <>
      <nav
        className="flex items-center gap-1.5 mb-3.5"
        style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}
      >
        <Link href="/" className="hover:[color:var(--text)] no-underline">
          Home
        </Link>
        <span>/</span>
        <span>Profile</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-serif text-h1 sm:text-display font-semibold tracking-tight">
          Profile
        </h1>
        <p className="mt-2 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
          Your account, academic profile, notifications, and preferences.
        </p>
      </header>

      <div className="grid items-start profile-grid" style={{ gridTemplateColumns: "220px minmax(0, 1fr)", gap: 48 }}>
        <aside className="hidden sm:block sm:sticky" style={{ top: 22 }}>
          <div
            className="uppercase font-semibold"
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.14em",
              color: "var(--text-3)",
              padding: "0 4px 12px",
              marginBottom: 6,
              borderBottom: "1px solid var(--line-2)",
            }}
          >
            On this page
          </div>
          <nav className="flex flex-col" style={{ gap: 1 }}>
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => goTo(e, s.id)}
                  className="flex items-center gap-2.5 transition-colors"
                  style={{
                    padding: "8px 12px",
                    fontSize: "var(--text-body-sm)",
                    color: active ? "var(--text)" : "var(--text-2)",
                    background: active ? "var(--surface-2)" : "transparent",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <Icon size={14} style={{ color: active ? "var(--text)" : "var(--text-3)" }} />
                  {s.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <div>
          {/* Profile */}
          <Section id="profile" title="Profile" subtitle="How you appear to your study group.">
            <div className="flex items-center gap-7 mb-6 flex-wrap">
              <div
                className="relative flex items-center justify-center font-semibold"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
                  border: "1px solid var(--line)",
                  fontSize: "1.7rem",
                  color: "var(--text-2)",
                }}
              >
                AM
                <button
                  type="button"
                  className="absolute flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    right: -2,
                    bottom: -2,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "var(--text)",
                    color: "var(--text-inv)",
                    border: "2px solid var(--surface)",
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <div style={{ fontSize: "var(--text-h3)", fontWeight: 600 }}>Amelia M.</div>
                <div className="mt-0.5" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}>
                  amelia.m@students.muk.ac.ug
                </div>
              </div>
            </div>
            <div className="grid gap-3.5 gap-x-5 grid-cols-1 sm:grid-cols-2">
              <Field label="Full name" defaultValue="Amelia Maganda" />
              <Field label="Display name" defaultValue="Amelia M." />
              <Field label="Email" defaultValue="amelia.m@students.muk.ac.ug" />
              <Field label="Phone (optional)" placeholder="+256 …" />
            </div>
          </Section>

          {/* Academics */}
          <Section id="academics" title="Academics" subtitle="Your university, year, and the electives you care about.">
            <div className="grid gap-3.5 gap-x-5 mb-5 grid-cols-1 sm:grid-cols-2">
              <Field label="University" defaultValue="Makerere University" />
              <Field label="Programme" defaultValue="Bachelor of Laws (LLB)" />
            </div>
            <div className="mb-4">
              <div style={{ fontSize: "var(--text-meta)", color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>
                Current year
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((y) => (
                  <PillButton key={y} active={year === y} onClick={() => setYear(y)}>
                    Year {y}
                  </PillButton>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div style={{ fontSize: "var(--text-meta)", color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>
                Current semester
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2].map((s) => (
                  <PillButton key={s} active={sem === s} onClick={() => setSem(s)}>
                    Semester {s}
                  </PillButton>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "var(--text-meta)", color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>
                Electives of interest
              </div>
              <div className="flex flex-wrap gap-2">
                {ELECTIVES.map((e) => (
                  <PillButton key={e} active={electives.has(e)} onClick={() => toggleElective(e)}>
                    {e}
                  </PillButton>
                ))}
              </div>
            </div>
          </Section>

          {/* Notifications */}
          <Section id="notifications" title="Notifications" subtitle="What we let you know about, and how often.">
            <ToggleRow
              title="Weekly digest email"
              desc="A short summary of new notes added to your year, every Sunday."
              on={toggles.digest}
              onChange={() => setToggles((t) => ({ ...t, digest: !t.digest }))}
            />
            <ToggleRow
              title="New notes in my courses"
              desc="Get notified when a lecturer or peer adds notes to a course you're taking."
              on={toggles.newNotes}
              onChange={() => setToggles((t) => ({ ...t, newNotes: !t.newNotes }))}
            />
            <ToggleRow
              title="New cases added to the Library"
              desc="Especially useful around exam time. Quiet by default."
              on={toggles.newCases}
              onChange={() => setToggles((t) => ({ ...t, newCases: !t.newCases }))}
            />
            <ToggleRow
              title="Reading reminders"
              desc="A nudge to keep your streak alive if you haven't opened anything for two days."
              on={toggles.reminders}
              onChange={() => setToggles((t) => ({ ...t, reminders: !t.reminders }))}
              last
            />
          </Section>

          {/* Activity */}
          <Section id="activity" title="Activity" subtitle="What you've been reading, at a glance.">
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}
            >
              {STATS.map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--line-2)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    className="uppercase font-medium"
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      color: "var(--text-3)",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    className="mt-1.5"
                    style={{ fontSize: "1.4rem", fontWeight: 600, letterSpacing: "-0.01em" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1" style={{ fontSize: "0.76rem", color: "var(--text-3)" }}>
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Account */}
          <Section id="account" title="Account" subtitle="Security, data, and the door out.">
            <AccountRow
              title="Change password"
              desc="We'll send a verification link to your university email."
              buttonLabel="Update"
            />
            <AccountRow
              title="Export bookmarks"
              desc="Download a JSON file of your saved notes and folders."
              buttonLabel="Export"
            />
            <AccountRow title="Sign out" desc="Sign out of this browser session." buttonLabel="Sign out" />
            <AccountRow
              title="Delete account"
              desc="Removes your profile, bookmarks and folders. Cannot be undone."
              buttonLabel="Delete"
              danger
              last
            />
          </Section>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .profile-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8" style={{ scrollMarginTop: 24 }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <div
          className="flex items-baseline justify-between gap-4 px-4 sm:px-[22px] py-4 sm:py-[18px]"
          style={{ borderBottom: "1px solid var(--line-2)" }}
        >
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{title}</h2>
            <p className="mt-1" style={{ fontSize: "var(--text-body-sm)", color: "var(--text-3)" }}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-[22px]">{children}</div>
      </div>
    </section>
  );
}

function Field({
  label,
  defaultValue,
  placeholder,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: "var(--text-meta)", color: "var(--text-3)", fontWeight: 500 }}>
        {label}
      </label>
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="outline-none transition-all focus:[border-color:var(--text-2)] focus:shadow-[0_0_0_4px_rgba(15,15,16,0.05)]"
        style={{
          padding: "10px 14px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.92rem",
          color: "var(--text)",
        }}
      />
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer transition-colors"
      style={{
        padding: "7px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? "var(--text)" : "var(--line)"}`,
        background: active ? "var(--text)" : "var(--surface)",
        color: active ? "var(--text-inv)" : "var(--text-2)",
        fontSize: "var(--text-body-sm)",
      }}
    >
      {children}
    </button>
  );
}

function ToggleRow({
  title,
  desc,
  on,
  onChange,
  last,
}: {
  title: string;
  desc: string;
  on: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-5"
      style={{
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--line-2)",
      }}
    >
      <div className="min-w-0">
        <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500, color: "var(--text)" }}>
          {title}
        </div>
        <div className="mt-1" style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}>
          {desc}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onChange}
        className="relative cursor-pointer transition-colors"
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          background: on ? "var(--text)" : "var(--surface-3)",
          border: `1px solid ${on ? "var(--text)" : "var(--line)"}`,
          flexShrink: 0,
        }}
      >
        <span
          aria-hidden
          className="absolute"
          style={{
            top: 2,
            left: 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--surface)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            transform: on ? "translateX(18px)" : "translateX(0)",
            transition: "transform 0.2s var(--ease-out)",
          }}
        />
      </button>
    </div>
  );
}

function AccountRow({
  title,
  desc,
  buttonLabel,
  danger,
  last,
}: {
  title: string;
  desc: string;
  buttonLabel: string;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--line-2)",
      }}
    >
      <div>
        <div style={{ fontSize: "var(--text-body-sm)", fontWeight: 500 }}>{title}</div>
        <div className="mt-1" style={{ fontSize: "var(--text-meta)", color: "var(--text-3)" }}>
          {desc}
        </div>
      </div>
      <button
        type="button"
        className="cursor-pointer transition-all"
        style={{
          padding: "8px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--line)",
          background: "var(--surface)",
          fontSize: "0.85rem",
          color: danger ? "var(--text-2)" : "var(--text)",
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
