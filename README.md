# Syed Muhammad Tafseer Raza Bukhari — Portfolio

Production personal portfolio built with Astro 6, TypeScript, GSAP, ScrollTrigger, Lenis and native CSS.

## Current pages

- Home: cinematic scroll hero, featured projects and engineering toolkit.
- About: background, education, experience and engineering approach.
- Work: eight content-driven project entries with varying case-study detail.
- Contact: email plus six linked social and freelance profiles.
- Privacy: current website and hosting information.

## Cinematic hero

The production sequence uses 240 desktop and 120 mobile HQ WebP frames, supported by 11 lightweight scrub atlas pages (7 desktop, 4 mobile). The original legacy JPEG assets remain in the repository.

The HQ sequence is source-derived at 1280 x 720. It is not AI-upscaled or a 4K restoration.

## Local development

Use Node.js 22.12 or later.

    npm ci
    node scripts/verify-project.mjs
    npm run build
    npm run dev

The existing verification script checks legacy portrait assets, key source files, contact links and stylesheet integrity. The production build additionally runs Astro's type checks.

## Production deployment

- Hosting: Cloudflare Pages
- Production branch: main
- Build command: npm run build
- Output directory: dist
- Environment variable: PUBLIC_SITE_URL=https://smtafseer.pages.dev

The Astro sitemap integration generates sitemap-index.xml. robots.txt points search engines to that sitemap. GitHub Actions checks project integrity and the production build.

## Identity and external links

The primary professional name is Syed Muhammad Tafseer Raza Bukhari. Some linked services retain older display names or usernames. Existing profile URLs are intentionally preserved.

## Project integrity

TradeMind is presented as private engineering and research work. Concept imagery must not be described as verified production screenshots, and no unsupported performance or business metrics should be claimed.

Hero scripts, original image sequences, motion behavior and the global design system should not be modified as part of content or SEO cleanup.
