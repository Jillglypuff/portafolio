import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.jillglypuff.com',
  adapter: vercel(),
  integrations: [vue(), icon(), sitemap()],
});