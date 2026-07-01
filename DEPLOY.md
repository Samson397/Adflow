# Fuse — Vercel deploy fix

## Your 404 on `fuse-beryl.vercel.app`

That URL is **not** the project connected to GitHub. It is an empty/orphan Vercel project with **no deployment** (`x-vercel-error: NOT_FOUND`).

The app **did deploy successfully** from GitHub to a different project:

**https://fuse-samsons-projects-8c2b6db5.vercel.app**

(GitHub → Vercel bot shows deployment `success` on commit `4e9fd5f`.)

---

## Fix in 3 steps (Vercel Dashboard)

### 1. Turn off Deployment Protection (required for mobile/public access)

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the **Fuse** project linked to `Samson397/Adflow` (not "fuse-beryl" if that is a separate empty project)
3. **Settings → Deployment Protection**
4. For **Production**, disable protection or choose **“Only Preview Deployments”**
5. Save

Without this, visitors are redirected to Vercel login and the site looks broken on mobile.

### 2. Use the correct domain

Either use:

**https://fuse-samsons-projects-8c2b6db5.vercel.app**

Or assign your preferred name to the **GitHub-linked** project:

1. **Settings → Domains**
2. Add `fuse-beryl.vercel.app` to the **Adflow/Fuse** project (the one with successful deployments)
3. Remove it from any empty duplicate project

### 3. Add environment variables

**Settings → Environment Variables** (Production):

| Name | Value |
|------|--------|
| `OPENAI_API_KEY` | your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Then **Deployments → Redeploy** latest `main`.

---

## Verify it works

Open the production URL on your phone. You should see:

- **Fuse** header
- **“Paste your URL”** input
- **Analyze** button

Not “NOT_FOUND” and not a Vercel login page.

---

## Optional: delete the empty project

If `fuse-beryl` is a duplicate project with no Git link, delete it in Vercel to avoid confusion.
