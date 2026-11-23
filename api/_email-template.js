/**
 * Branded HTML email for website enquiries.
 * Files starting with "_" in /api are not deployed as endpoints by Vercel.
 *
 * Built for email clients: table layout, inline styles, 600px max width,
 * no web fonts, no CSS that Outlook/Gmail strip. Every value is HTML-escaped.
 */

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

const BRAND = {
  ink: '#0b1020',
  cyan: '#04c8db',
  pink: '#ff2b87',
  text: '#1d2333',
  muted: '#6b7385',
  line: '#e6e8ef',
  page: '#f2f3f7',
};

// Business contact details shown at the bottom of every enquiry email.
const BUSINESS = {
  name: 'EPIC Party Hire Melbourne',
  mainPhone: { label: '1800 463 742', tel: '1800463742' },
  owners: [
    { name: 'Cardez', label: '0404 875 801', tel: '+61404875801' },
    { name: 'Spock', label: '0417 308 645', tel: '+61417308645' },
    { name: 'Millsy', label: '0468 937 636', tel: '+61468937636' },
  ],
  email: 'melbourne@epicpartyhire.com.au',
  web: 'epicpartyhire.com.au',
};

export function formatEventDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

export function buildSubject(f) {
  const parts = [`New enquiry: ${f.item || 'Party hire'}`];
  if (f.name) parts.push(f.name);
  const date = formatEventDate(f.date);
  if (date) parts.push(date);
  return parts.join(' · ').slice(0, 180);
}

export function buildText(f) {
  const date = formatEventDate(f.date);
  return [
    'NEW EVENT ENQUIRY',
    '',
    `Name:          ${f.name}`,
    `Email:         ${f.email}`,
    `Phone:         ${f.phone || 'Not supplied'}`,
    `Event date:    ${date || 'Not supplied'}`,
    `Event type:    ${f.eventType || 'Not supplied'}`,
    `Suburb:        ${f.suburb || 'Not supplied'}`,
    `Interested in: ${f.item || 'Not sure yet'}`,
    '',
    'Notes:',
    f.notes || 'None',
    '',
    '---',
    BUSINESS.name,
    `Main line: ${BUSINESS.mainPhone.label}`,
    ...BUSINESS.owners.map((o) => `${o.name}: ${o.label}`),
    BUSINESS.email,
    BUSINESS.web,
    '',
    'Reply to this email to respond to the customer directly.',
    'Sent from the enquiry form on epicpartyhire.com.au. This is an enquiry, not a confirmed booking.',
  ].join('\n');
}

export function buildHtml(f, { logoUrl, siteUrl }) {
  const e = escapeHtml;
  const date = formatEventDate(f.date);
  const firstName = (f.name || '').split(/\s+/)[0] || 'customer';
  const replySubject = `Re: your EPIC Party Hire enquiry${f.item ? ` (${f.item})` : ''}`;
  const mailto = `mailto:${encodeURIComponent(f.email)}?subject=${encodeURIComponent(replySubject)}`;
  const tel = f.phone ? `tel:${f.phone.replace(/[^\d+]/g, '')}` : '';
  const preheader = [f.item, date, f.suburb].filter(Boolean).join(' · ') || 'New enquiry from the website';

  const row = (label, value, { strong = false } = {}) => `
          <tr>
            <td style="padding:14px 0 12px;border-bottom:1px solid ${BRAND.line};width:132px;vertical-align:top;font:600 13px/1.5 Arial,Helvetica,sans-serif;color:${BRAND.muted};">${e(label)}</td>
            <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};vertical-align:top;font:${strong ? 700 : 400} 15px/1.5 Arial,Helvetica,sans-serif;color:${value ? BRAND.text : '#a3a9b7'};">${value ? e(value) : 'Not supplied'}</td>
          </tr>`;

  const button = (href, label, bg, color) => `
                <td style="padding:0 8px 8px 0;">
                  <a href="${e(href)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${bg};color:${color};font:700 14px/1 Arial,Helvetica,sans-serif;text-decoration:none;">${e(label)}</a>
                </td>`;

  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${e(buildSubject(f))}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${e(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.page};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Brand header -->
          <tr>
            <td style="background:${BRAND.ink};padding:22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <a href="${e(siteUrl)}" style="text-decoration:none;"><img src="${e(logoUrl)}" width="140" height="88" alt="EPIC Party Hire" style="display:block;border:0;width:140px;height:auto;max-width:140px;color:#ffffff;font:700 18px Arial,Helvetica,sans-serif;"></a>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block;padding:7px 14px;border-radius:999px;background:${BRAND.pink};color:#ffffff;font:700 12px/1 Arial,Helvetica,sans-serif;letter-spacing:.04em;">NEW ENQUIRY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:${BRAND.cyan};">&nbsp;</td></tr>

          <!-- Summary -->
          <tr>
            <td style="padding:28px 28px 8px;">
              <p style="margin:0 0 6px;font:600 13px/1.4 Arial,Helvetica,sans-serif;color:${BRAND.muted};">${e(f.eventType || 'Event enquiry')}${date ? ` · ${e(date)}` : ''}</p>
              <h1 style="margin:0 0 6px;font:800 24px/1.25 Arial,Helvetica,sans-serif;color:${BRAND.text};">${e(f.item || 'General party hire enquiry')}</h1>
              <p style="margin:0;font:400 15px/1.5 Arial,Helvetica,sans-serif;color:${BRAND.muted};">From <strong style="color:${BRAND.text};">${e(f.name)}</strong>${f.suburb ? ` in ${e(f.suburb)}` : ''}</p>
            </td>
          </tr>

          <!-- Quick actions -->
          <tr>
            <td style="padding:18px 28px 6px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>${button(mailto, `Reply to ${firstName}`, BRAND.pink, '#ffffff')}${tel ? button(tel, `Call ${f.phone}`, BRAND.ink, '#ffffff') : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding:14px 28px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row('Name', f.name, { strong: true })}
                ${row('Email', f.email)}
                ${row('Phone', f.phone)}
                ${row('Event date', date)}
                ${row('Event type', f.eventType)}
                ${row('Suburb', f.suburb)}
                ${row('Interested in', f.item, { strong: true })}
              </table>
            </td>
          </tr>

          <!-- Notes -->
          <tr>
            <td style="padding:18px 28px 28px;">
              <p style="margin:0 0 8px;font:600 13px/1.5 Arial,Helvetica,sans-serif;color:${BRAND.muted};">Notes from the customer</p>
              <div style="padding:14px 16px;border-radius:10px;background:#f6f7fa;border-left:4px solid ${BRAND.cyan};font:400 15px/1.6 Arial,Helvetica,sans-serif;color:${BRAND.text};white-space:pre-wrap;">${f.notes ? e(f.notes) : '<span style="color:#a3a9b7;">No notes added.</span>'}</div>
            </td>
          </tr>

          <!-- Business details -->
          <tr>
            <td style="padding:24px 28px;background:${BRAND.ink};">
              <p style="margin:0 0 4px;font:800 16px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;">${e(BUSINESS.name)}</p>
              <p style="margin:0 0 16px;font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#9ba3b4;">Party &amp; event hire across Melbourne</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 14px;">
                    <span style="display:block;font:600 12px/1.4 Arial,Helvetica,sans-serif;color:${BRAND.cyan};">Main line</span>
                    <a href="tel:${e(BUSINESS.mainPhone.tel)}" style="font:800 20px/1.3 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;">${e(BUSINESS.mainPhone.label)}</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>${BUSINESS.owners.map((o) => `
                  <td width="33%" style="padding:0 8px 14px 0;vertical-align:top;">
                    <span style="display:block;font:600 12px/1.4 Arial,Helvetica,sans-serif;color:${BRAND.cyan};">${e(o.name)}</span>
                    <a href="tel:${e(o.tel)}" style="font:700 14px/1.4 Arial,Helvetica,sans-serif;color:#ffffff;text-decoration:none;white-space:nowrap;">${e(o.label)}</a>
                  </td>`).join('')}
                </tr>
              </table>
              <p style="margin:2px 0 0;font:400 13px/1.7 Arial,Helvetica,sans-serif;color:#c9ced8;">
                <a href="mailto:${e(BUSINESS.email)}" style="color:#c9ced8;text-decoration:none;">${e(BUSINESS.email)}</a><br>
                <a href="https://${e(BUSINESS.web)}" style="color:#c9ced8;text-decoration:none;">${e(BUSINESS.web)}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px;background:#fafbfc;border-top:1px solid ${BRAND.line};font:400 12px/1.6 Arial,Helvetica,sans-serif;color:${BRAND.muted};">
              Reply to this email to respond to ${e(firstName)} directly.<br>
              Sent from the enquiry form on <a href="${e(siteUrl)}" style="color:${BRAND.muted};">epicpartyhire.com.au</a>. This is an enquiry, not a confirmed booking.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
