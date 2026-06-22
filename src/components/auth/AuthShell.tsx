import Link from "next/link";
import { BookOpen, FileText, Sparkles } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: FileText,
    title: "Notes, organised by your syllabus",
    body: "Every course unit, by year and semester — peer-reviewed and exam-ready.",
  },
  {
    icon: BookOpen,
    title: "One library for the law",
    body: "Case law, statutes, statutory documents, decrees and legal notices in one place.",
  },
  {
    icon: Sparkles,
    title: "AI built for Ugandan law",
    body: "Ask a note, get a summary, or define a term — grounded in the syllabus.",
  },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand / onboarding panel */}
      <aside className="auth-brand relative hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-[var(--line-2)]">
        <div className="auth-rise">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sikia-law-logo.svg"
            alt="Sikia Law"
            style={{ height: 56, width: "auto", display: "block" }}
          />
        </div>

        <div className="max-w-[440px]">
          <h1 className="auth-rise-1 font-serif font-semibold tracking-tight text-[2.4rem] leading-[1.1] text-[color:var(--text)]">
            Your law degree,{" "}
            <span className="text-[color:var(--orange-dark)]">organised.</span>
          </h1>
          <p className="auth-rise-1 mt-4 text-[color:var(--text-2)] text-[1.05rem] leading-relaxed">
            A study companion for Ugandan law students — your notes, the library,
            and an AI tutor, all in one place.
          </p>

          <ul className="auth-rise-2 mt-9 flex flex-col gap-5">
            {VALUE_PROPS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="flex items-start gap-3.5">
                  <span
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: "var(--orange-wash)",
                      color: "var(--orange-dark)",
                      border:
                        "1px solid color-mix(in srgb, var(--orange) 24%, transparent)",
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <div>
                    <div className="font-sans font-semibold text-[0.96rem] text-[color:var(--text)]">
                      {p.title}
                    </div>
                    <div className="text-[color:var(--text-2)] text-[0.9rem] leading-snug mt-0.5">
                      {p.body}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="auth-rise-3 text-[color:var(--text-3)] text-[0.82rem]">
          Built for students at Makerere &amp; beyond.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-6 py-12 sm:px-10 bg-[var(--surface)]">
        {/* Mobile logo (brand panel is hidden below lg) */}
        <Link href="/" className="lg:hidden mb-10 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sikia-law-logo.svg"
            alt="Sikia Law"
            style={{ height: 40, width: "auto", display: "block" }}
          />
        </Link>
        <div className="w-full max-w-[380px]">{children}</div>
      </main>
    </div>
  );
}
