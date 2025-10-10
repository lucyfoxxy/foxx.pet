// astro.config.mjs
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import goatcounterInline from './integrations/goatcounter-inline.js';

export default defineConfig({
  server: { host: true, port: 4321 },
  vite: {
    server: {
      hmr: { host: 'dev.foxx.pet', protocol: 'wss', clientPort: 443 }
    },
    build: {
      assetsInlineLimit: 0
    },             
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@Pages': fileURLToPath(new URL('./src/components/Pages', import.meta.url)),
        '@Styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@Design': fileURLToPath(new URL('./src/components/Design', import.meta.url)),
        '@Content': fileURLToPath(new URL('./src/content', import.meta.url)),
        '@Assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@Scripts': fileURLToPath(new URL('./src/scripts', import.meta.url)),
      }
    }
  },
  integrations: [
    goatcounterInline({
      endpoint: process.env.GOATCOUNTER_ENDPOINT || "https://stats.foxx.pet/count",
      enabled: process.env.GOATCOUNTER_ENABLED || false,
      fallbackPath: process.env.GOATCOUNTER_FALLBACK || "/var/www/shared/goatcounter/count.js",
    }),
  ],
});
