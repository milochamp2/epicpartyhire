import { cpSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dest = resolve(root, 'dist');
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const name of ['index.html', 'privacy.html', '404.html', 'styles.css', 'script.js', 'robots.txt', 'sitemap.xml', 'favicon.ico', 'apple-touch-icon.png', 'site.webmanifest']) {
  if (!existsSync(resolve(root, name))) throw new Error(`Missing ${name}`);
  copyFileSync(resolve(root, name), resolve(dest, name));
}
for (const name of ['assets', 'thumbnails']) cpSync(resolve(root, name), resolve(dest, name), { recursive: true });
console.log('✓ EPIC Party Hire built to dist/ (Vercel will deploy this directory).');
