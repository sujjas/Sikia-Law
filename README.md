# Sikia Law

A click-through wireframe demo for Sikia Law — a legal research tool for Ugandan law students.

## What's in this repo

Two parallel versions of the wireframe live here:

- **v1** (root) — the original click-through demo the client first reviewed. Marketing site + dashboard.
- **v2** (`/v2`) — the notes-led rework based on client feedback (Apr 2026). Year-organised notes, library consolidation, full-content document reader.

Styling is intentionally greyscale — this is a wireframe, not the final visual design.

## Deployed routes

### Marketing (shared between v1 and v2)
- `/` — Homepage
- `/about` — About
- `/features` — Features
- `/contact` — Contact
- `/login`, `/signup` — Auth screens

### v1 dashboard
- `/dashboard` — Authenticated home
- `/case-law` — Case law browser
- `/statutes` — Statute browser
- `/notes` — Personal notes
- `/document` — Case law reader
- `/bookmarks`, `/search`, `/profile` — etc.

### v2 dashboard (new direction)
- `/v2` or `/v2/dashboard` — Notes-led home with year overview, activity, library shortcut
- `/v2/notes` — Year → Semester → Course Unit → Notes
- `/v2/library` — Cases / statutes / statutory documents in one place
- `/v2/document?file=…` — Full-content reader with TOC, related notes, download
- `/v2/bookmarks`, `/v2/search`, `/v2/profile` — etc.

## Local preview

No build step. Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit `http://localhost:8000/` for v1 and `http://localhost:8000/v2/sikia-dashboard.html` for v2.

## Deploy to Vercel

This repo is configured for zero-config deployment to Vercel.

1. Push to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other** (Vercel auto-detects as a static site).
4. Deploy.

`vercel.json` handles:
- Clean URLs for both v1 and v2 routes (see route lists above)
- Long-cache headers on the bundled Font Awesome `.otf`
- Basic security headers (X-Frame-Options, nosniff, Referrer-Policy)

## File structure

```
index.html                     v1 marketing homepage
sikia-*.html                   v1 marketing + dashboard pages

v2/
  sikia-dashboard.html         v2 Home (notes-led)
  sikia-notes.html             v2 Notes hub
  sikia-library.html           v2 Library
  sikia-document.html          v2 Document reader
  sikia-bookmarks.html         v2 Bookmarks + folders
  sikia-search.html            v2 Search
  sikia-profile.html           v2 Profile
  curriculum.json              Source of truth for years/semesters/courses/notes
  notes-content/               Per-note extracted HTML wrapped as JS modules
    manifest.js                  → maps html_file paths to slugs
    <slug>.js                    → 95 files, one per note
  fonts/
    fontawesome-regular.otf    Font Awesome 7 Pro Regular (loaded locally)

Notes/
  YR X SEM Y/PDFs/             95 original lecture-note PDFs

vercel.json                    Vercel deploy config
```

Each HTML file is self-contained — all CSS and JS are inlined. The only external assets are the bundled Font Awesome font, the per-note content JS files, and the original PDFs.
