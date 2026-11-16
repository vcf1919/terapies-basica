// Código de PLANTILLA. La URL del sitio sale del config del cliente.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadConfig } from './src/lib/config.ts';

const { config } = loadConfig();

export default defineConfig({
  site: config.sitio.url,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
