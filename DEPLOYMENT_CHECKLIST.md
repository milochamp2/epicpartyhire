# EPIC Party Hire — staging and domain checklist

- [ ] Unzip and open the folder in Cursor.
- [ ] Run `npm run check` and `npm run build`.
- [ ] Push to a new GitHub repository; avoid uploading secrets.
- [ ] Deploy repository on Vercel; confirm output folder is `dist`.
- [ ] Open the assigned `*.vercel.app` staging URL on a phone and desktop.
- [ ] Verify logo and every promo image load (the old screenshots showed broken image placeholders).
- [ ] Confirm package prices and GST/delivery terms with owners.
- [ ] Verify all menu links, carousel buttons, and product → enquiry preselection.
- [ ] Configure Resend: verify sender domain, create key, set `RESEND_API_KEY` and `EPIC_FROM_EMAIL` in Vercel, redeploy.
- [ ] Test enquiry send and receipt at `melbourne@epicpartyhire.com.au`; test blocked/outage fallback.
- [ ] Add rate limiting/Turnstile before opening the form to heavy public traffic.
- [ ] Review and publish your business privacy policy; confirm required legal/business details.
- [ ] Confirm phone number and branded email.
- [ ] Add analytics and consent arrangements only if desired and compliant.
- [ ] Compare current DNS records, especially **MX, SPF, DKIM and DMARC**, before any domain switch.
- [ ] Point website DNS to Vercel only when approved; keep mail records intact.
- [ ] Verify both www and root domain, SSL, redirect, sitemap and Google Search Console.
