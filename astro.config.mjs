// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import typography from '@tailwindcss/typography';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Added this line
  output: 'server',

  integrations: [tailwind({
    config: {
      plugins: [
        typography(),
      ],
    },
  })],

  adapter: vercel()
});