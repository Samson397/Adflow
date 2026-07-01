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

Open [http://localhost:3000](http://localhost:3000) on your computer.

## Use on mobile (deploy to the web)

`localhost` only works on the machine running the dev server. To use **Fuse on your phone**, deploy it to a public URL.

### Deploy with Vercel (recommended, free)

1. Push this repo to GitHub (e.g. `github.com/YOUR_USER/Fuse`)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add environment variables in Vercel → **Settings → Environment Variables**:
   - `OPENAI_API_KEY` = your OpenAI key
   - `OPENAI_MODEL` = `gpt-4o-mini` (optional)
4. Click **Deploy**
5. Open the `https://your-app.vercel.app` URL on your phone

No code changes needed — Vercel detects Next.js automatically.

### After deploy

- Bookmark the Vercel URL on your home screen (works like an app on iOS/Android)
- The UI is mobile-friendly (responsive layout, safe-area padding)

### Troubleshooting 404

If you get **NOT_FOUND** on your Vercel URL, see **[DEPLOY.md](./DEPLOY.md)**. Common causes:

1. Wrong project URL (e.g. `fuse-beryl` not linked to GitHub)
2. **Deployment Protection** enabled (blocks public access — disable for Production)

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
