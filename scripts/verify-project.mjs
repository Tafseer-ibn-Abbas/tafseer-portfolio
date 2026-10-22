/** Dependency-free source and asset verification. Run: node scripts/verify-project.mjs */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const read = (name) => readFileSync(join(root, name), 'utf8');
const must = (test, message) => { if (!test) throw new Error(`FAIL: ${message}`); };
const desktop = join(root, 'public/frames/hero/desktop');
const mobile = join(root, 'public/frames/hero/mobile');
for (const [dir, total, label] of [[desktop, 300, 'Desktop'], [mobile, 120, 'Mobile']]) {
  must(existsSync(dir), `${label} hero image directory missing`);
  const files = readdirSync(dir).filter((file) => /^\d{4}\.jpg$/.test(file));
  must(files.length === total, `${label} portrait frames: expected ${total}, found ${files.length}`);
  for (let i = 1; i <= total; i++) {
    const filename = `${String(i).padStart(4, '0')}.jpg`;
    const full = join(dir, filename);
    must(existsSync(full) && statSync(full).size > 1000, `${label} hero frame missing/damaged: ${filename}`);
  }
  console.log(`PASS: ${label} frames ${total}/${total}`);
}
const css = read('src/styles/global.css');
must(Buffer.byteLength(css) > 78_000, 'Global stylesheet incomplete (possible old V11 truncation)');
must(css.includes('FINAL STABLE RECONSTRUCTION') && css.includes('.site-footer--editorial'), 'Critical style sections missing');
console.log(`PASS: Complete global stylesheet (${Buffer.byteLength(css)} bytes)`);
const scripts = read('src/scripts/home-interactions.ts');
must(scripts.includes('ringPoints(18') && scripts.includes('IntersectionObserver'), 'Contained floating toolkit script missing');
const contact = read('src/pages/contact/index.astro');
for (const service of ['LINKEDIN','GITHUB','UPWORK','FIVERR','WHATSAPP','INSTAGRAM']) {
  must(contact.includes(`name: '${service}'`), `Contact card missing: ${service}`);
}
must(contact.includes("identity: 'Syed Tafseer Abbas'") && contact.includes("identity: 'Zaki Ibn Abbas'"), 'Freelancing display names missing');
must(!contact.includes('@zakiibnabbas ·'), 'Old Fiverr handle text accidentally restored');
for (const file of [
  'src/pages/index.astro', 'src/pages/about/index.astro', 'src/pages/contact/index.astro',
  'src/pages/work/index.astro','src/pages/projects/[slug].astro',
  'src/components/HeroSequence.astro','src/scripts/motion.ts','src/scripts/page-interactions.ts',
  'src/scripts/contact-interactions.ts','src/layouts/BaseLayout.astro','src/data/profile.ts',
  'public/hero-poster.webp','public/og/default.jpg','public/favicon.svg'
]) must(existsSync(join(root,file)),`Required source/asset missing: ${file}`);
const profile = read('src/data/profile.ts');
must(profile.includes('Syed Muhammad Tafseer Raza Bukhari'), 'Canonical name missing');
must(profile.includes('A3HVQGAV336ZH1') && profile.includes('syed_zaki_zulfiqar'), 'Latest contact URLs missing');
console.log('PASS: Routes, contact cards, SEO identity and interactive toolkit sources');
console.log('PASS: Reconstructed project source gate. (Astro production build is a separate step.)');
