@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Production Next.js implementation of the **Sikia Law** dashboard — a legal research/study tool for Ugandan law students. This `ready/` folder is the live app; the parent folder holds the click-through HTML wireframes that this app is being built from. See parent `CLAUDE.md` for full product context, design decisions, and the wireframe baseline.

The current scope is the dashboard home page, built as a token-driven component system so global token changes (colours, spacing, type) propagate everywhere.

## Stack

- **Next.js 16.2.6** App Router — see `AGENTS.md`: this version has breaking changes from earlier Next; consult `node_modules/next/dist/docs/` before writing framework code rather than relying on memorised APIs.
- **React 19.2.4**, **TypeScript 5**, server components by default (`'use client'` only where required).
- **Tailwind v4** via `@tailwindcss/postcss`. Tokens live in an `@theme` block in `src/app/globals.css`; semantic aliases on `:root`. No `tailwind.config.*`.
- **Fonts** loaded with `next/font/google`: Inter Tight (sans), Newsreader (serif), JetBrains Mono — exposed as CSS variables and used via type-scale utility classes.
- **Icons**: `lucide-react` (Font Awesome from the wireframes is not used here).
- **Dev-only tooling**: `interface-kit` and `agentation` are rendered as siblings to `{children}` in the root layout, gated by `process.env.NODE_ENV === "development"`.

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
└── dashboard/  page-level pieces — HeroGreeting, YearStrip, ContinueCard, StatTile, CourseTile, LibraryTile
```

`src/app/page.tsx` is a thin composition: mock data arrays (`CONTINUE_ITEMS`, `STATS`, `COURSES`, `LIBRARY`) fed into the components above. When data wiring lands it'll come from `curriculum.json` (parent folder) + user state.

### Sidebar IA (canonical)

Top-to-bottom: **Search → Home → Notes → Library → Bookmarks**, then the avatar block linking to `/profile`. Notes and Bookmarks carry count badges; Notes is the orange-accented one. This order matches the v2 wireframes and must stay in sync.

### Dev-tool integration

`src/app/layout.tsx` renders `InterfaceKit` and `Agentation` as **siblings** to `{children}` (not wrapping it), only in dev. The Agentation widget posts to a local server on `localhost:4747`; pending annotations are surfaced into Claude sessions automatically via the parent `.claude/agentation-pending.sh` UserPromptSubmit hook — address them inline and resolve via `mcp__agentation__agentation_resolve` when handled.

## Conventions

- Server components by default. Add `'use client'` only when the component needs state, effects, or browser APIs.
- Match the wireframe baseline (`../wireframes/sikia-*.html`) for IA and patterns; the wireframes are still the structural source of truth while visual design firms up.
- Greyscale palette only for non-brand surfaces until visual design is locked. Brand orange is currently used sparingly (active dot, primary CTA, primary stat underline).
- Use lucide icons; don't reintroduce Font Awesome here.
