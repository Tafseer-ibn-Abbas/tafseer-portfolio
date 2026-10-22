# Syed Muhammad Tafseer Raza Bukhari — portfolio

A cinematic, accessibility-conscious Astro personal website. This clean reconstruction preserves the established V10 hero/look, makes the 32-skill toolkit a bounded elliptical 3D-style floating cluster, and brings in the approved six-profile Contact page. This is **not** a new paid-template dependency or an unrelated redesign.

## Technologies

Astro 6, TypeScript, GSAP + ScrollTrigger, Lenis (desktop only), native CSS and small DOM interaction code. No Three.js, database, paid animation library, or UI-framework overhead.

## Page status

| Page | Status |
|---|---|
| Home | Complete for content/design QA (subject to real-device browser review) |
| About | Complete for content/design QA |
| Contact | Complete for content/design QA; platform links are those provided |
| Work | Starter index only — **case-study authoring pending** |
| Project detail | Draft routes — source facts, screenshots and approved links pending |

## What is included

- Full canonical name and supplied alternate names, metadata and JSON-LD person identity.
- 300 original desktop frames + 120 mobile frames (1280 × 720 JPEG) and poster image.
- Hero scroll sequence with lazy cache of nearest decoded frames, mobile/native scrolling, chapter text and smooth ticker.
- Two homepage project teasers and one CTA to the future project catalog.
- Bounded oval constellation of 32 technical skills: slow irregular individual drift, pointer/touch response, collision handling, no scrolling hijack. Graceful static grid for reduced motion or JS unavailable.
- About: engineering approach, SSUET BSCS 2024–expected 2028, TechSphere full-stack internship Mar–Apr 2026, public-safe TradeMind mention.
- Contact: email/Gmail compose, fallback email app, copy-email; LinkedIn, GitHub, Upwork, Fiverr, WhatsApp and Instagram, with platform logos and verified supplied names.
- Full-length original CSS preserved to prevent the earlier V11 truncation issue.
- Source and assets integrity checker: `node scripts/verify-project.mjs`.
- Safe PowerShell update script with per-file backups and SHA256 validation.

For Windows setup and deployment, read [START-HERE.md](START-HERE.md).

## Known limitations

- Source portrait frames are 1280 × 720 JPEGs; pixelation from source compression is not recoverable by CSS alone.
- Do not treat TradeMind concept art as actual screenshots or hypothetical performance metrics as validated production benchmarks.
- `/work/` is deliberately a draft until detailed, approved case studies are supplied.
- Actual `npm run build` and on-device production testing are still required. No unsupported Lighthouse or ranking claims.
