import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.jillglypuff.com',
  integrations: [vue(), icon(), sitemap()],
});