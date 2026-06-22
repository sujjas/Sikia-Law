# Sikia Law

A click-through wireframe demo for Sikia Law — a legal research tool for Ugandan law students.

The deployed app is the **v2 direction** — a notes-led, year-organised dashboard with the library consolidated. Marketing pages remain shared between versions.

Styling is intentionally greyscale — this is a wireframe, not the final visual design.

## Routes

### Marketing
- `/` — Homepage with scroll-linked hero
- `/about` — About
- `/features` — Features
- `/contact` — Contact
- `/login`, `/signup` — Auth

### Dashboard (notes-led)
- `/dashboard` — Greeting + activity + Year-at-a-glance + library shortcut
- `/notes` — Year → Semester → Course Unit → Notes
- `/library` — Cases / statutes / statutory documents in one place
- `/document?file=…` — Full-content reader with TOC and related notes
- `/bookmarks` — Saved notes + folders
- `/search` — Cross-content search
- `/profile` — Account, academics, notifications, activity

### Redirects (kept for any links already shared)
- `/v2/*` → corresponding `/*`
- `/case-law`, `/statutes` → `/library` (now consolidated)

## Local preview

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deploy to Vercel

This repo is configured for zero-config deployment to Vercel.

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other** (Vercel auto-detects as a static site).
4. Deploy.

`vercel.json` handles:
- Clean URLs (see route table above)
- 301-style redirects from old `/v2/*` and removed `/case-law`, `/statutes`
- Long-cache headers on the bundled Font Awesome OTF and the per-note JS bundles
- Basic security headers

## File structure

```
index.html                    Marketing homepage (scroll-linked hero)
sikia-about.html              About
sikia-features.html           Features
sikia-contact.html            Contact
sikia-login.html              Login
sikia-signup.html             Register

sikia-dashboard.html          Notes-led Home
sikia-notes.html              Notes hub (year/semester/course)
sikia-library.html            Library (cases / statutes / etc.)
sikia-document.html           Document reader
sikia-bookmarks.html          Bookmarks + folders
sikia-search.html             Search
sikia-profile.html            Profile

curriculum.json               Source of truth for the curriculum tree
notes-content/                Per-note extracted HTML wrapped as JS modules
  manifest.js                  → maps html_file paths to slugs
  <slug>.js                    → 95 files, one per note
fonts/
  fontawesome-regular.otf     Font Awesome 7 Pro Regular (loaded locally)

Notes/
  YR X SEM Y/PDFs/            95 original lecture-note PDFs

v2/                           Earlier staging copy of the dashboard pages.
                              Kept as a snapshot; the deployed app uses
                              the root-level files now. Redirects in
                              vercel.json route /v2/* back to /*.

vercel.json                   Vercel deploy config
DEPLOY.md                     Step-by-step push + import instructions
```

Each HTML file is self-contained — all CSS and JS are inlined. The only external assets are the bundled Font Awesome font, the per-note content JS files, and the original PDFs.
