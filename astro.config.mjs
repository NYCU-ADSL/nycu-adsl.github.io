import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import partytown from '@astrojs/partytown'

// https://astro.build/config
export default defineConfig({
  site: 'https://nycu-adsl.github.io',
  base: '/',
  integrations: [
    tailwind(),
    partytown({
        config: {
          forward: ["dataLayer.push"],
        },
    }),
  ],
  outDir: './dist',
  markdown: {}
});