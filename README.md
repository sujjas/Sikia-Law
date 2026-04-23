# Sikia Law

A click-through wireframe demo for Sikia Law — a legal research tool for Ugandan law students.

## Overview

This is a static HTML prototype containing the full marketing site and authenticated dashboard experience. Every link resolves; the whole flow is walk-through ready.

- **Marketing pages**: Home, About, Features, Contact, Login, Register
- **Dashboard pages**: Dashboard, Case Law, Statutes, Notes, Document reader, Bookmarks, Search, Profile

Styling is intentionally greyscale — this is a wireframe, not the final visual design.

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
3. Vercel auto-detects it as a static site — no framework preset needed.
4. Deploy.

`vercel.json` handles:
- `/` → homepage (via rewrite)
- Clean URLs: `/about`, `/features`, `/contact`, `/dashboard`, etc.
- Basic security headers

## File structure

```
index.html                     Marketing homepage (scroll-linked hero)
sikia-about.html               About page
sikia-features.html            Features page
sikia-contact.html             Contact page with validated form
sikia-login.html               Login
sikia-signup.html              Register

sikia-dashboard.html           Authenticated home
sikia-case-law.html            Case law browser
sikia-statutes.html            Statute browser
sikia-notes.html               Personal notes
sikia-document.html            Case law reader
sikia-bookmarks.html           Saved cases and statutes
sikia-search.html              Search results
sikia-profile.html             Account settings

sikia-homepage-wireframe.html  Earlier static wireframe (reference)
sikia-animations.html          Animation showcase (reference)

vercel.json                    Vercel deploy config
```

Each file is self-contained — all CSS and JS are inlined. No external dependencies, no build step.
