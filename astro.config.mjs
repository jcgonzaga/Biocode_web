// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import typography from '@tailwindcss/typography';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Added this line
  integrations: [tailwind({
    config: {
      plugins: [
        typography(),
      ],
    },
  })]
});