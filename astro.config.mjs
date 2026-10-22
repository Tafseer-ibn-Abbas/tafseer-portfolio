import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Before publishing, set PUBLIC_SITE_URL to the exact URL you actually own/control.
// Example: PUBLIC_SITE_URL=https://your-project.pages.dev
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'static',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
