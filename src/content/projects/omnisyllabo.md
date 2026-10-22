---
title: OmniSyllabo
summary: A personalized study and exam-preparation application helping Class XI Sindh Board students turn their syllabus into clear daily study actions.
year: '2026'
category: EdTech / Full-Stack Web Application & PWA
role: Product owner, full-stack developer and system architect
status: Published
order: 2
featured: true
tech:
- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase
- PostgreSQL
- Row Level Security
- Supabase Auth
- Edge Functions
- Deno
- Supabase Storage
- Cloudflare Pages
- Vitest
cover: /projects/omnisyllabo-home.webp
gallery:
- /projects/omnisyllabo-routine.webp
- /projects/omnisyllabo-features.webp
- /projects/omnisyllabo-footer.webp
liveUrl: https://omnisyllabo.pages.dev/
repoUrl: ''
---

## The challenge

Class XI students following the Sindh Board curriculum need to balance subject coverage, daily study time, revision and exam preparation. Planning can become a separate burden from studying, especially when progress is tracked across disconnected notes and resources.

## The approach

I built OmniSyllabo as a full-stack study companion that turns academic content and study routines into actionable steps. Students can organize subjects, choose a pace, complete learning and practice tasks, and resume from their saved progress.

The experience connects a React and TypeScript frontend with Supabase services for authentication, storage and PostgreSQL-backed persistence. The application is deployed on Cloudflare Pages with a responsive design and progressive-web-app support.

## What the product includes

- Personalized daily study planning, task organization and revision workflows.
- Curriculum coverage for Mathematics, Physics, English, Urdu and Islamiyat.
- Chapter-wise activities, practice tasks and interactive MCQ checkpoints.
- Progress tracking, achievements and study streaks.
- Access controls around 73 academic exam-preparation PDF resources, described by the project owner as being delivered through protected storage and signed URLs.
- Student accounts and cloud-backed progress synchronization.

## Engineering focus

My responsibilities included product direction, interface implementation, curriculum and content modeling, backend integration, database design, authentication, secure resource delivery, testing and deployment. The stated stack includes Supabase Auth, PostgreSQL with Row Level Security, TypeScript Edge Functions on Deno, Supabase Storage, Vite and Vitest.

## Current status

**Live educational web application:** [Open OmniSyllabo](https://omnisyllabo.pages.dev/). The screenshots here were supplied by the project owner and represent its public study-planning experience. Detailed internal authentication, protected file access and backend behavior are described from the supplied project case study rather than independently security-audited.
