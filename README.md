# EPIC Party Hire Melbourne — Cursor + Vercel website

This is the **working website source code**, not an HTML screenshot or image mockup. The project is a fast, zero-dependency static marketing site with an optional Vercel serverless enquiry API.

## Run it in Cursor

1. Unzip this entire project folder. **Do not separate `index.html` from `assets`, `thumbnails` or the CSS/JS files.**
2. Open the extracted `EPIC_Party_Hire_Cursor_Vercel` folder in Cursor (File → Open Folder).
3. Open Terminal in Cursor and run:

   ```bash
   npm run dev
   ```

4. Open **http://localhost:3000** in a browser. The dev server works with Node.js 20+ and doesn't require `npm install`.
5. Edit `index.html` for text and pricing, `styles.css` for design, and `script.js` for interactions.

## Build and deploy with Vercel

1. In Cursor's Terminal, run:

   ```bash
   npm run check
   npm run build
   ```

2. Push this entire **project root** into a GitHub repository (or import the folder via your preferred Vercel workflow).
3. Vercel → **Add New Project** → import your GitHub repository.
4. Framework preset: **Other** (Vercel can read `vercel.json` automatically).
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy and use the new temporary `*.vercel.app` address for testing. **Do not transfer `epicpartyhire.com.au` until everything has been checked.**

## Enquiry form — important

The form POSTs to `/api/enquiry` with a serverless function using Resend to email the business at `melbourne@epicpartyhire.com.au`.

**Email delivery won't work until you add environment settings in Vercel:**

- `RESEND_API_KEY` — your private Resend API key
- `EPIC_FROM_EMAIL` — a sender address on a domain **verified by Resend** (for example, `website@YOUR-VERIFIED-DOMAIN`)

Until these are configured, a submitted enquiry shows a link that opens a prefilled message in the visitor's email app. **No enquiry is silently considered sent.** The enquiry is never represented as a confirmed booking.

For launch, also consider production-level spam protection (e.g. Cloudflare Turnstile), anti-abuse rate limiting, monitoring, a legally reviewed privacy policy and appropriate backup contact methods. The existing form includes basic validation and a honeypot, not complete abuse prevention.

## Website content

- EPIC logo, black / electric blue / hot pink / red premium glassmorphism aesthetic
- Hero, headline CTAs, mobile navigation and moving ticker
- Six requested product categories
- Featured packages with prices **copied from supplied promotional artwork**
- Extras including photo booth, fairy floss, karaoke, arcade and patio heaters
- New ownership introduction featuring **Cardez, Spock and Millsy**
- Process section, FAQs, package carousel and quote enquiry
- Responsive layouts, basic SEO tags, sitemap, robots.txt, favicons, image alt text, accessible form status and reduced-motion styles
- 15 separate **150 × 150 px** PNG thumbnails in `thumbnails/`, and larger optimised WebP artwork in `assets/`

## Promotional pricing review

Prices in the promotional images (AUD): Kids $510; VIP Night $975; Corporate $1,500; Movie Night $400; Engagement Special 1 $995; Engagement Special 2 $975. Do not assume these include delivery or other costs. Confirm whether prices are current and GST treatment before publishing. The artwork is intentionally retained to preserve its original fine print.

## File layout

```text
EPIC_Party_Hire_Cursor_Vercel/
├── index.html           # Landing page
├── styles.css           # Brand/design system + mobile styles
├── script.js            # Navigation, package selection, enquiry UX
├── privacy.html         # Draft privacy/enquiry notice (review before launch)
├── 404.html             # Not found page
├── assets/              # Full-size, optimised promotional artwork + logo
├── thumbnails/          # 15 exact 150x150 PNGs
├── api/enquiry.js       # Optional serverless email handler (Resend)
├── scripts/dev.mjs      # Local server (no dependencies)
├── scripts/build.mjs    # Copies site to dist/
├── scripts/check.mjs    # Basic static asset audit
├── vercel.json          # Vercel build output and headers
├── package.json
├── .env.example
├── CURSOR_BRIEF.md
├── DEPLOYMENT_CHECKLIST.md
├── robots.txt
└── sitemap.xml
```

## Domain and email safety

Changing `epicpartyhire.com.au` DNS later should only happen after a working Vercel staging deployment is approved. **Preserve the current MX, SPF, DKIM and DMARC DNS records** used for business email; only change the DNS records needed for the website after confirming the DNS provider's requirements. Configure both `epicpartyhire.com.au` and `www.epicpartyhire.com.au` with appropriate redirects.

## No external JavaScript dependencies

The user-facing site is built from regular HTML, CSS and JavaScript with no bundling dependency. Cursor can edit it directly and Vercel can deploy it quickly. This also means no paid website framework is required.
