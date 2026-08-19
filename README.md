# CVForge

A modern, professional, ATS-friendly CV and resume builder built with Next.js, TypeScript, and Tailwind CSS.

**Live app:** [cvforge.pichchanthorn.me](https://cvforge.pichchanthorn.me/)

![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## About

CVForge helps you build a clean, ATS-friendly resume in minutes. Pick a template, fill in your details, and export straight to PDF or Word — all your data stays in your browser via `localStorage`, so there's no account and no server-side storage.

## Features

- 🎨 Multiple resume templates, including Creative and Portrait layouts
- 📄 Export to PDF and Word (`.docx`)
- 💾 Auto-save to `localStorage` — your progress is never lost on refresh
- 📱 Fully responsive, mobile-friendly editor
- 🌐 Bilingual support (English / Khmer)
- ✅ ATS-friendly formatting out of the box

## Screenshots

<!-- Add screenshots here, e.g.: -->
<!-- ![Dashboard](./public/screenshots/dashboard.png) -->
<!-- ![Editor](./public/screenshots/editor.png) -->
<!-- ![Templates](./public/screenshots/templates.png) -->

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router, static export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Storage:** Browser `localStorage` (no backend/database)
- **Deployment:** GitHub Actions → GitHub Pages
- **Domain:** Custom domain (`cvforge.pichchanthorn.me`) via Namecheap DNS, pointed to GitHub Pages

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/pichchanthorn/cvforge.git
cd cvforge
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page auto-updates as you edit files inside `app/`.

## Preview Deployments

The repo is connected to Cloudflare Pages for branch previews, separate from the `main` → GitHub Pages production deploy. Every branch pushed gets its own automatic preview build at:

```
https://<branch-name-with-slashes-as-dashes>.cvforge-ao2.pages.dev
```

For example, `feature/ats-match` is live at **[feature-ats-match.cvforge-ao2.pages.dev](https://feature-ats-match.cvforge-ao2.pages.dev)**.

These are read-only preview builds — nothing here touches the live `cvforge.pichchanthorn.me` domain or the `main` branch's GitHub Pages deployment. Preview-specific environment variables (e.g. `NEXT_PUBLIC_ATS_MATCH_API_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) are configured in the Cloudflare Pages project settings, scoped separately from Production.

## In Progress: AI-Powered ATS Match

An in-editor panel that scores how well your CV matches a pasted job description, with matched/missing keyword highlights and suggestions — built as a separate Cloudflare Worker (`workers/ats-match/`) to keep the frontend on static export while adding a real backend for this one feature.

**Status:** feature-complete end-to-end in demo mode, not yet merged to `main`.

- ✅ Cloudflare Worker deployed, with real rate-limiting (5 req/IP/min) and real Cloudflare Turnstile bot verification
- ✅ Frontend Sheet UI in the editor — loading states, error handling, full mobile responsiveness (300–375px)
- ✅ Verified end-to-end on the preview deployment above
- ⏳ AI matching logic is currently **mocked** (keyword overlap, not a real model call) — pending Anthropic API credit purchase before the real Claude API call is wired in
- ⏳ Not yet merged to `main` / not on the production domain

Track progress on the [`feature/ats-match` branch](https://github.com/pichchanthorn/cvforge/tree/feature/ats-match) and its [pull request](https://github.com/pichchanthorn/cvforge/pulls).

## Roadmap

- [ ] Swap ATS Match from mocked keyword-matching to a real Claude API call
- [ ] Cover letter generation
- [ ] Additional resume templates
- [ ] Khmer-English bilingual resume export

## Contributing

This is currently a personal project, but suggestions and issues are welcome — feel free to open an issue or pull request.

## License

This project is currently unlicensed for reuse. Contact the author for permissions.

## Author

**Pich Chanthorn**
- Portfolio: [pichchanthorn.me](https://pichchanthorn.me)
- LinkedIn: [linkedin.com/in/pichchanthorn](https://www.linkedin.com/in/pichchanthorn)
- GitHub: [@pichchanthorn](https://github.com/pichchanthorn)
