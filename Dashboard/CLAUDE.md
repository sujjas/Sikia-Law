@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Production Next.js implementation of the **Sikia Law** dashboard — a legal research/study tool for Ugandan law students. This folder is the live app; the parent folder holds the click-through HTML wireframes this app was built from. See parent `CLAUDE.md` for full product context and the wireframe baseline.

Scope so far: the dashboard home, notes hub, **document reader** (`/document`), library, bookmarks, search, and profile — all token-driven so global token changes (colours, spacing, type) propagate everywhere. The reader is also where the **Phase-1 AI features** live (see *AI features* below).

## Stack

- **Next.js 16.2.6** App Router — see `AGENTS.md`: this version has breaking changes from earlier Next; consult `node_modules/next/dist/docs/` before writing framework code rather than relying on memorised APIs.
- **React 19.2.4**, **TypeScript 5**, server components by default (`'use client'` only where required).
- **Tailwind v4** via `@tailwindcss/postcss`. Tokens live in an `@theme` block in `src/app/globals.css`; semantic aliases on `:root`. No `tailwind.config.*`.
- **Fonts** loaded with `next/font/google`: Inter Tight (sans), Newsreader (serif), JetBrains Mono — exposed as CSS variables and used via type-scale utility classes.
- **Icons**: `lucide-react` (Font Awesome from the wireframes is not used here).
- **Animation**: `gsap` (drives the desktop Ask-panel open/close). CSS keyframes/transitions for everything else.
- **Dev-only tooling**: `agentation` is rendered as a sibling to `{children}` in the root layout, gated by `process.env.NODE_ENV === "development"`. (`interface-kit` was removed.)

## Commands

```bash
npm run dev      # next dev — http://localhost:3000
npm run build    # next build
npm run start    # next start (after build)
npm run lint     # eslint (flat config in eslint.config.mjs)
```

There is no test setup in this project.

## Architecture

### Token-driven design system

`src/app/globals.css` is the single source of truth for design tokens:

- **`@theme` block** — Tailwind v4 tokens (colour scales: stone 50–950, orange 50–950, petrol 50–950; semantic families forest/amber/indigo/rust each with base/dark/wash; the full type scale `text-display`/`text-h1..h4`/`text-body`/`text-overline`/`text-num`/`text-mono`; spacing, radius, shadow, motion easings).
- **`:root` aliases** — semantic colour names + layout tokens (`--width-sidebar`, `--page-px`, `--page-pt`, `--page-pb`, `--card-px`, `--stat-px`, `--sidebar-px`, `--nav-item-*`, etc.) consumed via `style={{ paddingInline: "var(--page-px)" }}` so layout density can be retuned globally.

**Don't hardcode colours, spacing, or type sizes in components.** Reach for a token; if one doesn't exist, add it to `globals.css` first.

### Component layout

```
src/components/
├── ui/         primitives — Logo, Button, Avatar, Badge/CountBadge, LinkPill, SearchInput, ProgressThin
├── layout/     shells — Sidebar, SidebarNavItem, Topbar, Section
├── dashboard/  home pieces — HeroGreeting, YearStrip, ContinueCard, StatTile, CourseTile, LibraryTile
├── document/   reader — DocumentReader, ReadingProgress, AskPanel (chat), SummaryCard (TL;DR)
├── notes/ · library/ · bookmarks/ · search/ · profile/   page views
src/lib/
├── curriculum-lookup.ts   note/year/semester resolution
├── notes-content.ts       loads extracted note HTML (server-only)
└── ask-demo.ts            AI types + curated demo answer/summary bank (see AI features)
```

`src/app/page.tsx` is a thin composition: mock data arrays fed into components. Data comes from `src/data/curriculum.json` + per-note HTML in `notes-content/` (loaded via `notes-content.ts`).

### Sidebar IA (canonical)

Top-to-bottom: **Search → Home → Notes → Library → Bookmarks**, then the avatar block linking to `/profile`. Notes and Bookmarks carry count badges; Notes is the orange-accented one. This order matches the v2 wireframes and must stay in sync.

### Dev-tool integration

`src/app/layout.tsx` renders `Agentation` as a **sibling** to `{children}` (not wrapping it), only in dev. The widget posts to a local server on `localhost:4747`; pending annotations are surfaced into Claude sessions automatically via the parent `.claude/agentation-pending.sh` UserPromptSubmit hook — address them inline and resolve via `mcp__agentation__agentation_resolve` when handled.

## AI features (Phase 1)

The roadmap's first AI surface, all in the **document reader**. There is **no LLM / API key** — answers are simulated (see "demo bank"), so the *UX* is fully reviewable and the wiring is ready to swap for a real model (Vercel AI Gateway / Claude) with no UI change.

### Surfaces

- **Ask this note** — `AskPanel.tsx`. A scoped chat. Floating launcher → panel. Empty state has starter chips; answers stream in, carry a typed **Sources** strip (Section / Statute / Case Law / Your note), and pin **follow-up** chips above the composer. Citation chips of kind `section` scroll the reader to the live heading; the rest are external authorities. Guardrails: out-of-scope/other-jurisdiction questions **refuse**; notes with no extracted text show an "I can't read this note" state.
- **Summarise** — `SummaryCard.tsx`, pinned at the top of the reader. One tap → brief "Summarising…" shimmer → an inline **AI Summary** card (TL;DR + key points + the same cited Sources + Copy/Hide).
- **Define inline** — `DefineInline.tsx`. Select a legal term in the prose → a floating **Define** affordance → a popover with a plain-English definition + cited authority. Backed by a curated Ugandan-law **glossary** in `ask-demo.ts` (`lookupDefinition`); unknown selections get an honest "no entry" rather than a guess. Portalled to `<body>`; dismisses on Esc / scroll / outside-click.
- **Smart search** — `/search` (`SearchView.tsx` + `src/lib/search.ts`). Semantic-feeling search over the **whole curriculum** (`getAllNotes`): a synonym map (`SYNONYMS`) expands a query so "fairness" → Equity, "crime" → Criminal Law, etc., with a "also matching …" hint. No API/embeddings — ranked keyword + synonym match. Built with the **`transitions-dev`** skill: sliding **year tabs** (segmented control), **skeleton** rows while "searching", and a **staggered reveal** of results.

All four Phase-1 student-facing AI features are now in: **Ask this note · Summarise · Define inline · Smart search.**

### Demo bank (`src/lib/ask-demo.ts`)

Single source of truth for the AI logic + the shared types (`AskHeading`, `Source`, `SourceKind`, `KIND_LABEL`, `meaningfulHeadings`, `resolveDemoSources`). It holds **hand-authored, correctly-cited** answers + summaries for showcase notes (currently *Introducing Law Notes* and *Equity & Trusts — Q&A*), keyed by note title. `section` sources carry a `match` (a normalised heading substring) that resolves to a live heading id so citations actually scroll. Notes/questions with no curated entry fall back to a generic note-aware engine (templated prose using the note's real headings). To add a showcase note: read its content, add a `DemoBank` to `ASK_DEMO` with 5–6 Q&As (starters + chained follow-ups) and a `summary` — and verify every `match` hits a real heading.

### AI aesthetic

The AI layer is the one place that breaks the greyscale-with-sparing-orange baseline, via `--ai-*` tokens (`--ai-from`, `--ai-tint`, `--ai-ring`, `--ai-glow`, `--ai-text`). It is now **solid brand orange** everywhere (orb, avatars, send, launcher spark) — the orange→petrol **gradient was retired** (`--ai-grad`/`--ai-grad-soft` removed). Source material stays sober/serif so students always tell apart what they read vs. what the AI said.

### Animation decisions (Emil Kowalski / `make-interfaces-feel-better` skills in `.agents/skills/`)

- **Desktop Ask panel:** origin-aware **scale + fade** (`0.96 → 1` from the launcher rect, `transform-origin` at the button), ~240ms ease-out; exit faster. GSAP-driven (`AskPanel.tsx`, plain `useEffect` not `useGSAP` so it's deterministic under React's dev double-invoke). (Earlier morph/genie variants were tried and replaced.)
- **Mobile Ask panel:** iOS bottom sheet — **92dvh, 24px top corners, grab handle**, `--ease-drawer` curve, **velocity-aware drag-to-dismiss** (flick > 0.4px/ms or pull > 28%), boundary damping, and **Vaul-style background scaling** (`html.ask-sheet-open` scales `.page-panel`). The panel is **portalled to `document.body`** so the background can scale without scaling the sheet.
- Respect `prefers-reduced-motion`.

## Gotchas

- **Turbopack dev cache wedges.** `next dev` (esp. after its out-of-memory auto-restart) repeatedly serves **stale CSS/JS** — edits to `globals.css` don't show up. Symptom: computed styles / behaviour lag the source. Fix: kill port 3000, `rm -rf .next`, restart. A plain browser hard-refresh is often not enough.
- **`section` citations only scroll if the `match` resolves** to a live heading (headings are slugified at runtime in `DocumentReader`). Match on a normalised substring of a *real* heading.

## Conventions

- Server components by default. Add `'use client'` only when the component needs state, effects, or browser APIs.
- Match the wireframe baseline (`../wireframes/sikia-*.html`) for IA and patterns; the wireframes are still the structural source of truth while visual design firms up.
- Greyscale palette only for non-brand surfaces until visual design is locked. Brand orange is currently used sparingly (active dot, primary CTA, primary stat underline).
- Use lucide icons; don't reintroduce Font Awesome here.
