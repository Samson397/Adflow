# Fix Fuse 404 on Vercel

Your app **is built and deployed**. The problems are Vercel settings, not missing code.

---

## You are opening the wrong URL

| URL | What happens |
|-----|----------------|
| `https://fuse-beryl.vercel.app` | **404** — empty project, not connected to Git |
| `https://fuse-samsons-projects-8c2b6db5.vercel.app` | **Your real app** (after step 2 below) |

Naming the project **fuse** in Git is correct. Vercel auto-assigns a URL like `fuse-samsons-projects-….vercel.app`, not always `fuse-beryl`.

---

## Step 1 — Open the correct Vercel project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open the project that shows **Git: Samson397/Adflow** (named **fuse**)
3. Do **not** use a separate empty project that only has `fuse-beryl`

---

## Step 2 — Turn OFF Deployment Protection (required for phone)

Your app currently redirects everyone to a **Vercel login page**. On mobile this often looks like a broken site or 404.

1. In the **fuse** project → **Settings**
2. **Deployment Protection**
3. For **Production**:
   - Turn **OFF** “Vercel Authentication”, or
   - Set protection to **“Only Preview Deployments”**
4. **Save**

---

## Step 3 — Redeploy

1. **Deployments** tab
2. Click **⋯** on the latest `main` deployment
3. **Redeploy**

---

## Step 4 — Open this URL on your phone

```
https://fuse-samsons-projects-8c2b6db5.vercel.app
```

You should see **Fuse** and **“Paste your URL”**.

---

## Step 5 — (Optional) Use `fuse-beryl.vercel.app`

Only after step 2 works:

1. Delete the **empty** `fuse-beryl` project if it exists (the one with no Git repo)
2. In the **Git-linked fuse** project → **Settings → Domains**
3. **Add** `fuse-beryl.vercel.app`

---

## Step 6 — Add OpenAI key

**Settings → Environment Variables** → Production:

- `OPENAI_API_KEY` = your key
- `OPENAI_MODEL` = `gpt-4o-mini`

Redeploy again.

---

## Still stuck?

In Vercel → **fuse** project → **Deployments** → latest deployment:

- Status must be **Ready** (green)
- If **Build Failed**, open the build log and send the error text.
