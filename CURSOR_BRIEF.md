# Cursor implementation brief — EPIC Party Hire Melbourne

## Goal
Launch a new premium, responsive party-hire website based on the supplied EPIC artwork and reference screenshots. Maintain a separated staging deployment on Vercel, then switch the existing domain only after approval.

## Brand direction
- Midnight/black background, electric blue/cyan, hot pink, punchy red and neon violet.
- Retro arcade-inspired bold italic typography, LED/glow lighting, editorial typography and layered glassmorphism cards.
- Premium visual hierarchy and legibility. Product posters are marketing artwork, not enough on their own to communicate an item's name and enquiry action.
- Balance animation with performance. Honour `prefers-reduced-motion`.

## Requirements delivered
- Responsive hero, navigation, CTA, six requested category tiles, package rail, extras, three-step booking journey, ownership introduction, FAQs, contact form and footer.
- High-resolution campaign images as WebP and 15 small 150x150 PNG thumbnails. Do not use 150px files as full-size hero imagery.
- Real lead submission flow at `/api/enquiry`, gated on private Vercel env vars, with a non-deceptive mailto fallback.
- Source project packaged for Cursor and Vercel, no npm dependencies.

## Known TODOs before production
1. Confirm each promotion and the terms/GST/delivery with EPIC's owners.
2. Verify full owner's names and preferred introduction copy if public identities will be expanded. Current copy uses exactly Cardez, Spock and Millsy.
3. Add verified Resend domain, production API key, form abuse prevention, and email delivery verification.
4. Replace the draft privacy information page with a legally reviewed business privacy policy.
5. Get owner sign-off on all marketing copy and image rights.
6. Test on iPhone Safari, Android Chrome and desktop browsers.
7. Connect the domain only after staging and preserve business email DNS entries.

## Source of truth
The uploaded flyers and landing-page ZIP are the source for offers and imagery. Do not infer free shipping, unlimited delivery regions, booking confirmation, payment, or promotion expiry dates from graphic design.
