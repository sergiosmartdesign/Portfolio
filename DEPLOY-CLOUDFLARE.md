# Deploy checklist — Cloudflare Pages + working contact form

The contact form is fully pre-wired. On Cloudflare it works once you plug in the
keys below. Nothing here touches the visual design.

**Architecture**
- Front end: `js/contact.js` POSTs the message to `/api/contact` and shows a real
  success only when the backend confirms it (otherwise it reveals a direct-email
  link). Cloudflare **Turnstile** guards against spam.
- Back end: `functions/api/contact.js` (a Cloudflare Pages Function) verifies the
  Turnstile token and relays the message to your inbox via **Resend**.

> Until the steps below are done, the code ships the official Turnstile **test
> key** (always passes) and has no Resend key, so real spam protection and real
> delivery are **not** active yet. On GitHub Pages there is no `/api/contact`, so
> a submit fails gracefully to the "write me directly" email link.

---

## 1. Connect the repo to Cloudflare Pages

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
**Connect to Git** → pick this repo. Build settings:

| Field | Value |
|---|---|
| Framework preset | **None** |
| Build command | *(leave empty — static site, no build)* |
| Root directory | **`web`** |
| Build output directory | **`.`** *(root of `web`, where `index.html` lives)* |

Because the root directory is `web`, Cloudflare finds the function at
`web/functions/api/contact.js` and serves it at `/api/contact`. Deploy once.

## 2. Add your custom domain

Pages project → **Custom domains** → add `sergio-ayala.com` (and `www`). Follow
the prompts; since DNS will be on Cloudflare this is a couple of clicks.
(This also replaces the current l.ink parking-page redirect.)

## 3. Turnstile (anti-spam)

Dashboard → **Turnstile** → **Add site** → domain `sergio-ayala.com`,
widget mode **Managed**. You get a **Site Key** and a **Secret Key**.

1. In `js/contact.js`, replace the test key:
   ```js
   const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';  // ← your real Site Key
   ```
   Then run `./scripts/cache-bust.sh` and commit so the new `?v=` ships.
2. In the Pages project → **Settings ▸ Environment variables** add (as **Secret**):
   `TURNSTILE_SECRET_KEY = <your Turnstile secret key>`

## 4. Resend (mail delivery)

1. Create a free account at resend.com (no credit card, 3,000 emails/mo).
2. **Add & verify the domain** `sergio-ayala.com` (Resend gives you DNS records;
   add them in Cloudflare DNS — a few TXT/MX records, verifies in minutes).
3. Create an **API key**.
4. In the Pages project → Environment variables add:
   | Name | Value | Type |
   |---|---|---|
   | `RESEND_API_KEY` | `re_...` | **Secret** |
   | `CONTACT_TO` | `mail@sergio-ayala.com` | Plaintext *(optional; this is the default)* |
   | `CONTACT_FROM` | `Portfolio <contact@sergio-ayala.com>` | Plaintext *(optional; must be on the verified domain)* |

   `reply_to` is set to the visitor's address automatically, so you just hit
   Reply to answer them.

## 5. (Optional) Receive at mail@sergio-ayala.com

If that inbox isn't set up yet: Dashboard → **Email Routing** → enable, then
route `mail@sergio-ayala.com` → forward to your real inbox (Proton/Gmail). Free.

## 6. Redeploy & test

Re-deploy (any push triggers it). Then on the live site: submit the form with a
real message → you should see `> MESSAGE SENT ✓` and receive the email. Try a
blank/invalid field and confirm it's rejected.

---

### Environment variables summary

| Variable | Required | Default | Notes |
|---|---|---|---|
| `TURNSTILE_SECRET_KEY` | yes | — | Turnstile secret (secret) |
| `RESEND_API_KEY` | yes | — | Resend API key (secret) |
| `CONTACT_TO` | no | `mail@sergio-ayala.com` | destination inbox |
| `CONTACT_FROM` | no | `Portfolio <contact@sergio-ayala.com>` | must be a verified Resend sender |

### Local testing (optional)

Install Wrangler and run the Pages dev server so `/api/contact` exists locally:
```bash
npx wrangler pages dev web --compatibility-date=2024-01-01
```
Set the same env vars via a `.dev.vars` file (never commit it). The Turnstile
**test** secret `1x0000000000000000000000000000000AA` always verifies.
