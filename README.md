# Fuse

Turn any product or landing page URL into AI-generated **videos, images, music**, and editable Meta/Google ad copy. **Say it. Fuse it.**

## Features

- **URL extraction** — Open Graph, Twitter cards, JSON-LD, and meta tags
- **Preview & edit** — Review and override title, description, images, price, and CTA
- **Creative studio** — Generate videos, images, and music via [aivideoapi.ai](https://aivideoapi.ai):
  - **Video:** Seedance 2.0, Veo 3.1, Sora 2, Kling 3.0/2.6, HappyHorse, WAN, Grok Imagine
  - **Image:** GPT Image 2, Nano Banana 2, Nano Banana, Ideogram V4, Seedream 5.0
  - **Music:** Suno V5.5, Suno V5
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

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AIVIDEOAPI_API_KEY=sk-your-aivideoapi-key
```

> **OpenAI** powers ad copy generation (optional). **aivideoapi.ai** powers video, image, and music generation via `AIVIDEOAPI_API_KEY`. Without an OpenAI key, ad copy uses rule-based fallback. Creative generation requires `AIVIDEOAPI_API_KEY`.

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
   - `AIVIDEOAPI_API_KEY` = your aivideoapi.ai key ([get one here](https://aivideoapi.ai/dashboard/api-keys))
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
2. Review extracted page details on `/preview` (with site-type intelligence)
3. **Fuse campaign** on `/campaign` — AI-planned image → video → music → ad copy (auto-generates images when the page has none)
4. Or use **Manual studio** on `/studio` for individual generations
5. Or choose Meta/Google platforms on `/ads` for ad copy only
6. Edit generated variants and export on `/editor`

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/extract` | POST | Fetch and parse a URL (`{ url }`) |
| `/api/analyze` | POST | Classify site type and image strategy |
| `/api/plan` | POST | Build a full campaign plan |
| `/api/credits` | GET | Query aivideoapi.ai credit balance |
| `/api/ads/generate` | POST | Generate ad variants from page details |
| `/api/generate/submit` | POST | Submit video/image/music generation |
| `/api/generate/status/[taskId]` | GET | Poll generation task status |

## Security

URL extraction blocks private IPs and localhost (SSRF protection) and only allows HTTP/HTTPS schemes.

## License

MIT
