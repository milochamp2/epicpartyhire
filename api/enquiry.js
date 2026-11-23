/**
 * Vercel Serverless Function — POST /api/enquiry
 * Optional Resend integration. No secrets are shipped to the browser.
 * Set RESEND_API_KEY and EPIC_FROM_EMAIL in Vercel settings.
 * From address must belong to a Resend-verified domain.
 */
const TO_EMAIL = 'melbourne@epicpartyhire.com.au';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tidy = (value, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ ok: false, error: 'Expected JSON.' });
  }
  if (Number(req.headers['content-length'] || 0) > 15000) {
    return res.status(413).json({ ok: false, error: 'Request is too large.' });
  }
  let data = req.body;
  try { if (typeof data === 'string') data = JSON.parse(data); } catch { return res.status(400).json({ ok: false, error: 'Invalid JSON.' }); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: 'Invalid submission.' });
  }
  // Honeypot: an apparently successful empty response avoids teaching bots the trap.
  if (tidy(data.website, 100)) return res.status(200).json({ ok: true });
  const fields = {
    name: tidy(data.name, 100),
    email: tidy(data.email, 160),
    phone: tidy(data.phone, 50),
    date: tidy(data.date, 20),
    eventType: tidy(data.eventType, 70),
    suburb: tidy(data.suburb, 100),
    item: tidy(data.item, 120),
    notes: tidy(data.notes, 1800),
  };
  if (!fields.name || !emailRegex.test(fields.email)) {
    return res.status(422).json({ ok: false, error: 'Provide your name and valid email address.' });
  }
  if (fields.date && !/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
    return res.status(422).json({ ok: false, error: 'Invalid event date.' });
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
        html: `<div style="font-family:Arial,sans-serif"><h2>New EPIC Party Hire enquiry</h2><table>${rows}</table><p>Submission is an enquiry, not a booking confirmation.</p></div>`,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: 'Email delivery failed.' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Email service temporarily unavailable.' });
  }
}
