/**
 * Vercel Serverless Function — POST /api/enquiry
 * Optional Resend integration. No secrets are shipped to the browser.
 * Set RESEND_API_KEY and EPIC_FROM_EMAIL in Vercel settings.
 * From address must belong to a Resend-verified domain.
 *
 * Abuse protection layers:
 *  - same-origin check (blocks other websites posting to this endpoint)
 *  - honeypot field + minimum time-to-fill (blocks most bots silently)
 *  - link / spam-keyword filter
 *  - best-effort per-IP rate limit (pair with a Vercel Firewall rate-limit rule)
 *  - strict field allow-list, length caps, control-character stripping, HTML escaping
 */
const TO_EMAIL = 'melbourne@epicpartyhire.com.au';
const emailRegex = /^[A-Za-z0-9._%+'-]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/;
const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 1000 * 60 * 60 * 6;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 1000 * 60 * 15;

// Strip control characters (prevents header/subject injection), collapse to one line unless multiline.
const CONTROL_CHARS = new RegExp("[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]", "g");
const tidy = (value, max = 500, multiline = false) => {
  if (typeof value !== 'string') return '';
  let out = value.replace(CONTROL_CHARS, "");
  out = multiline ? out.replace(/\r\n?/g, '\n') : out.replace(/[\r\n\t]+/g, ' ');
  return out.trim().slice(0, max);
};
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// Best-effort in-memory limiter: resets when the function instance is recycled.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}

const spammy = (text) => {
  const links = (text.match(/https?:\/\/|www\.|\[url|<a\s/gi) || []).length;
  return links > 1 || /\b(viagra|cialis|casino|crypto ?invest|bitcoin|forex|seo services|backlinks|loan offer)\b/i.test(text);
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }
  if (!sameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden.' });
  }
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ ok: false, error: 'Expected JSON.' });
  }
  if (Number(req.headers['content-length'] || 0) > 15000) {
    return res.status(413).json({ ok: false, error: 'Request is too large.' });
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    res.setHeader('Retry-After', String(RATE_WINDOW_MS / 1000));
    return res.status(429).json({ ok: false, error: 'Too many enquiries. Please call or email us instead.' });
  }
  let data = req.body;
  try { if (typeof data === 'string') data = JSON.parse(data); } catch { return res.status(400).json({ ok: false, error: 'Invalid JSON.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: 'Invalid submission.' });
  }
  // Bot traps: honeypot filled, or form submitted impossibly fast / with a missing or stale timer.
  // Respond with an apparent success so bots don't learn what tripped them.
  const elapsed = Date.now() - Number(data.startedAt);
  if (tidy(data.website, 100) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_AGE_MS) {
    return res.status(200).json({ ok: true });
  }
  const fields = {
    name: tidy(data.name, 100),
    email: tidy(data.email, 160),
    phone: tidy(data.phone, 30),
    date: tidy(data.date, 10),
    eventType: tidy(data.eventType, 70),
    suburb: tidy(data.suburb, 100),
    item: tidy(data.item, 120),
    notes: tidy(data.notes, 1800, true),
  };
  if (!fields.name || !emailRegex.test(fields.email)) {
    return res.status(422).json({ ok: false, error: 'Provide your name and valid email address.' });
  }
  if (fields.phone && !/^[0-9+()\s-]{6,30}$/.test(fields.phone)) {
    return res.status(422).json({ ok: false, error: 'Invalid phone number.' });
  }
  if (fields.date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
    return res.status(422).json({ ok: false, error: 'Invalid event date.' });
  }
  if (spammy(Object.values(fields).join(' '))) {
    return res.status(200).json({ ok: true });
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EPIC_FROM_EMAIL;
  if (!apiKey || !from) {
    return res.status(503).json({ ok: false, error: 'Email service not configured.' });
  }
  const rows = Object.entries(fields).map(([key, value]) =>
    `<tr><th style="text-align:left;padding:9px;border-bottom:1px solid #ddd">${escapeHtml(key)}</th>` +
    `<td style="padding:9px;border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value || 'Not supplied')}</td></tr>`,
  ).join('');
  const text = Object.entries(fields).map(([key, value]) => `${key}: ${value || 'Not supplied'}`).join('\n');
  try {
    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [TO_EMAIL],
        reply_to: fields.email,
        subject: `EPIC Party Hire enquiry — ${fields.item || 'New event'}`,
        html: `<div style="font-family:Arial,sans-serif"><h2>New EPIC Party Hire enquiry</h2><table>${rows}</table><p>Submission is an enquiry, not a booking confirmation. Never change bank details or send money based on a website enquiry.</p></div>`,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      // Log Resend's reason (no customer data) so it shows in Vercel → Logs.
      const reason = (await upstream.text().catch(() => '')).slice(0, 400);
      console.error(`Resend rejected email: HTTP ${upstream.status} ${reason}`);
      return res.status(502).json({ ok: false, error: 'Email delivery failed.' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Email service temporarily unavailable.' });
  }
}
