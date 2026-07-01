# Fuse

Turn any product or landing page URL into editable Meta and Google ad copy. **Say it. Fuse it.**

## Features

- **URL extraction** — Open Graph, Twitter cards, JSON-LD, and meta tags
- **Preview & edit** — Review and override title, description, images, price, and CTA
- **Multi-platform ads** — Generate variants for Meta (Facebook/Instagram) and Google Ads
- **Character limits** — Live counters with platform-specific max lengths
- **Export** — Copy JSON or download an ad bundle for manual import

## Tech stack

- Next.js 16 (App Router)
- Tailwind CSS
- cheerio (HTML parsing)
- OpenAI (ad copy generation)
- Zod (validation)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

> Without `OPENAI_API_KEY`, the app uses rule-based fallback copy so you can still test the full flow.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User flow

1. Paste a public URL on the homepage
2. Review extracted page details on `/preview`
3. Choose Meta/Google platforms and formats on `/ads`
4. Edit generated variants and export on `/editor`

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/extract` | POST | Fetch and parse a URL (`{ url }`) |
| `/api/ads/generate` | POST | Generate ad variants from page details |

## Security

URL extraction blocks private IPs and localhost (SSRF protection) and only allows HTTP/HTTPS schemes.

## License

MIT
