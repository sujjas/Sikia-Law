# Sikia Law — v2 (Notes-led dashboard)

Working draft of the **new dashboard direction** based on client feedback (Apr 2026).

## What's changing

The dashboard's centre of gravity moves from a flat library of legal sources to a **notes-led, year-based experience.**

- **Notes** become the dashboard's hero, organised by **Year 1 / Year 2 / Year 3 / Year 4**.
- A student lands in their own year by default, but can move freely into any other year.
- **Case Law, Statutes, Statutory Documents** (including Contract Law) collapse into a single **Library** section — still accessible, no longer top-billed.
- **Search** and **advanced search** stay as they are.
- **Bookmarks** stay — students can bookmark notes (and library items) to come back to.

## What's *not* changing

- The marketing site (Home, About, Features, Contact, Login, Signup) — gets its own pass after dashboard structure is locked.
- Profile / settings.
- The single-file HTML, greyscale, no-build conventions (see top-level `CLAUDE.md`).

## Resolved IA (per client confirmation, Apr 2026)

Three-level hierarchy inside each year, confirmed by the client's curriculum guide:

```
Year (1–4)
  └── Semester (1, 2)
        └── Course Unit (e.g. LAW 1108 Fundamentals of Criminal Law)
              └── Notes (one or more PDFs/docs)
```

Full curriculum captured in `curriculum.json` — that's the source of truth for years, semesters, and the courses inside each one. The client will share the actual lecture-note PDFs separately.

A few inconsistencies in the source spreadsheet are flagged inside `curriculum.json` under `_inconsistencies_to_flag` (e.g. Family Law II appears in both Year 2 and Year 3; LAW 4215 listed twice). Worth raising with the client before we commit to titles.

## Internal design thinking (not for client yet)

- **Dashboard home page**: likely becomes a year-selector at the top, with the student's current year expanded by default — recent notes surfaced underneath, plus a small Library shortcut. Surface a proposal to the client only once it's tangible enough to react to.
- **Sidebar restructure**: Dashboard / Notes / Library / Bookmarks / Search / Profile.

## Files in flight

The folder starts as a full mirror of v1 so the click-through stays working end-to-end while we restructure. Files most likely to change in v2:

| File | Likely change |
|------|---------------|
| `sikia-dashboard.html` | New home — year overview, recent notes, library shortcut |
| `sikia-notes.html` | Becomes year-organised; this is the new hero |
| `sikia-case-law.html` | Folded into a new `sikia-library.html` (or rename) |
| `sikia-statutes.html` | Folded into Library |
| Sidebar navigation across all dashboard pages | Restructured: Dashboard / Notes / Library / Bookmarks / Search / Profile |

`sikia-document.html`, `sikia-search.html`, `sikia-bookmarks.html`, `sikia-profile.html` mostly stay the same — only their sidebar nav updates.

Marketing pages (`sikia-homepage-animated.html`, `sikia-about.html`, `sikia-features.html`, `sikia-contact.html`, `sikia-login.html`, `sikia-signup.html`) stay untouched in v2 until structure is locked.

## How to preview

```bash
cd "/Users/elijahkasujja/Downloads/Sikia Law/v2"
python3 -m http.server 8001
# then open http://localhost:8001/sikia-homepage-animated.html
# (different port from v1 so they can run side-by-side)
```

## Where v1 lives

`../` (the parent folder) — the original dashboard. Don't edit there for this new direction; keep v1 intact for comparison and as the current client-shipped version.

The deploy folder `../sikia-law-deploy/` mirrors v1 and is what's currently on Vercel.
