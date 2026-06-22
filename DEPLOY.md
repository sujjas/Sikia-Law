# Deploy to GitHub + Vercel

## 1. Push to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Initial commit: Sikia Law wireframe"
git branch -M main

# Create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/sikia-law.git
git push -u origin main
```

## 2. Deploy to Vercel

**Option A — via dashboard (easiest):**

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository** and pick the `sikia-law` repo.
3. Framework preset: **Other** (Vercel will auto-detect as a static site).
4. Leave build & output settings blank.
5. Click **Deploy**.

Vercel will read `vercel.json` and apply:
- Clean URLs at `/about`, `/features`, `/contact`, `/dashboard`, `/case-law`, `/statutes`, `/notes`, `/document`, `/bookmarks`, `/search`, `/profile`, `/login`, `/signup`, `/register`
- Security headers (X-Frame-Options, nosniff, Referrer-Policy)

**Option B — via CLI:**

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

## 3. Updating the site

Any push to `main` auto-deploys. For previews, push to any other branch — Vercel creates a preview URL per branch.

## Notes

- All files are self-contained HTML (inline CSS + JS). No build step, no dependencies.
- The `.vercel` folder is gitignored — Vercel writes local metadata there after `vercel` CLI runs.
