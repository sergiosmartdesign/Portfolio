/**
 * Cloudflare Pages Function — POST /api/contact
 * ---------------------------------------------------------------------------
 * Backend for the contact form (js/contact.js). Flow:
 *   1. Parse + validate the JSON body (name / email / message, honeypot).
 *   2. Verify the Cloudflare Turnstile token server-side.
 *   3. Relay the message to the inbox via Resend.
 *
 * This file is auto-deployed by Cloudflare Pages because it lives under
 * `functions/` in the build output directory (`web/`). It serves at /api/contact.
 *
 * Required environment variables (set in the Cloudflare Pages dashboard —
 * Settings ▸ Environment variables; mark the two keys as "Secret"):
 *   RESEND_API_KEY        — Resend API key (re_...)                    [secret]
 *   TURNSTILE_SECRET_KEY  — Turnstile secret key (paired with the site key)  [secret]
 * Optional (have sensible defaults):
 *   CONTACT_TO            — destination inbox   (default mail@sergio-ayala.com)
 *   CONTACT_FROM          — verified Resend sender
 *                           (default "Portfolio <contact@sergio-ayala.com>")
 *
 * See DEPLOY-CLOUDFLARE.md for the full setup checklist.
 */

const DEFAULT_TO   = 'mail@sergio-ayala.com';
const DEFAULT_FROM = 'Portfolio <contact@sergio-ayala.com>';

// Browser same-origin defense-in-depth: only accept form POSTs coming from our
// own pages. A missing Origin (curl, server-to-server) is left to Turnstile.
const ALLOWED_ORIGINS = new Set([
  'https://sergio-ayala.com',
  'https://www.sergio-ayala.com',
]);

const MAX = { name: 80, email: 120, message: 2000 };
// Pragmatic email shape check; the real validation is that a reply actually sends.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function onRequestPost({ request, env }) {
  // ── 0. Origin gate ───────────────────────────────────────────────────────
  // Block cross-site browser submissions. Only enforced when an Origin header
  // is present (browsers always send one on this fetch); other clients still
  // have to pass the Turnstile check below.
  const origin = request.headers.get('Origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, error: 'Request not allowed.' }, 403);
  }

  // ── 1. Parse body ────────────────────────────────────────────────────────
  let data;
  try {
    data = await request.json();
  } catch (_) {
    return json({ ok: false, error: 'Malformed request body.' }, 400);
  }

  const name    = String(data.name    || '').trim();
  const email   = String(data.email   || '').trim();
  const message = String(data.message || '').trim();
  const company = String(data.company || '').trim();   // honeypot
  const token   = String(data['cf-turnstile-response'] || '');

  // Honeypot tripped → silently accept so the bot sees "success" and moves on.
  if (company) return json({ ok: true });

  // ── 2. Validate ──────────────────────────────────────────────────────────
  if (!name || !email || !message) {
    return json({ ok: false, error: 'Please fill in name, email and message.' }, 400);
  }
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return json({ ok: false, error: 'One of the fields is too long.' }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: 'That email address looks invalid.' }, 400);
  }

  // ── 3. Verify Turnstile ──────────────────────────────────────────────────
  if (!env.TURNSTILE_SECRET_KEY) {
    console.error('[contact] Missing TURNSTILE_SECRET_KEY env var');
    return json({ ok: false, error: 'Server is temporarily unavailable.' }, 500);
  }
  try {
    const form = new FormData();
    form.append('secret',   env.TURNSTILE_SECRET_KEY);
    form.append('response', token);
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) form.append('remoteip', ip);

    const verify = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: form },
    );
    const outcome = await verify.json();
    if (!outcome.success) {
      return json({ ok: false, error: 'Anti-spam verification failed. Please retry.' }, 403);
    }
  } catch (_) {
    return json({ ok: false, error: 'Could not verify anti-spam check.' }, 502);
  }

  // ── 4. Relay via Resend ──────────────────────────────────────────────────
  if (!env.RESEND_API_KEY) {
    console.error('[contact] Missing RESEND_API_KEY env var');
    return json({ ok: false, error: 'Server is temporarily unavailable.' }, 500);
  }

  const to   = env.CONTACT_TO   || DEFAULT_TO;
  const from = env.CONTACT_FROM || DEFAULT_FROM;
  const text =
    `New portfolio contact\n` +
    `----------------------\n` +
    `Name:  ${name}\n` +
    `Email: ${email}\n\n` +
    `${message}\n`;

  try {
    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Portfolio contact — ${name}`,
        reply_to: email,
        text,
      }),
    });

    if (!send.ok) {
      let detail = '';
      try { detail = (await send.json()).message || ''; } catch (_) {}
      console.error('[contact] Resend error', send.status, detail);
      return json({ ok: false, error: 'Mail service rejected the message.' }, 502);
    }
  } catch (err) {
    console.error('[contact] Resend request failed', err);
    return json({ ok: false, error: 'Could not reach the mail service.' }, 502);
  }

  return json({ ok: true });
}

// Only POST is defined, so Cloudflare Pages answers any other method on
// /api/contact with an automatic 405 Method Not Allowed.
