import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
let problems = 0;
for (const match of html.matchAll(/<(img|script|link)[^>]*(?:src|href)="([^"]+)"[^>]*>/g)) {
  const target = match[2];
  if (target.startsWith('http') || target.startsWith('#') || target.startsWith('mailto:') || target.startsWith('tel:')) continue;
  if (!existsSync(resolve(root, target.split('?')[0].replace(/^\//, '')))) { console.error('Missing:', target); problems++; }
}
const photos = [...html.matchAll(/<img[^>]+>/g)];
for (const [tag] of photos) if (!/alt="[^"]*"/.test(tag)) { console.error('Image missing alt:', tag.slice(0, 70)); problems++; }
console.log(`${photos.length} HTML image tags checked, ${problems} problems`);
if (problems) process.exit(1);
