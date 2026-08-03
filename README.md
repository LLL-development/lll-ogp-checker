# LLL OGP Checker

Developed by LLL Inc.'s dev team — visit us at https://www.live-laugh-love.world

Preview how a URL's link card will look before you share it. Enter a URL and see
how Open Graph / Twitter Card metadata renders across major platforms — no
account required.

**Live:** https://lll-ogp-checker.pages.dev/

## Features

- **URL check** — fetches a page server-side and extracts its OGP/Twitter Card metadata (title, description, image, favicon, site name)
- **Multi-platform preview** — renders accurate link-card mockups for Facebook, LinkedIn, LINE, X (Twitter), WhatsApp, WeChat, Slack, and Discord, each with platform-specific title/description truncation limits
- **Manual mode** — enter title, description, site, and image directly (with file upload) to preview a card without an existing live page
- **Warnings** — flags titles/descriptions that exceed a platform's display limit
- **Multi-language UI** — English, Japanese, and Simplified Chinese
- **Light/dark theme**

## Tech

- Frontend: plain HTML/CSS/JS (`public/`)
- Backend: Cloudflare Pages Functions (`functions/api/preview.ts`), metadata extraction via `HTMLRewriter` (`src/ogp.ts`)
- TypeScript, deployed via Wrangler

## Development

```bash
npm install
npm run dev        # wrangler pages dev public
```

## Deploy

```bash
npm run deploy      # wrangler pages deploy public --project-name lll-ogp-checker
```

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/preview?url=<url>` | GET | Fetches the target URL and returns its extracted OGP/Twitter metadata as JSON |