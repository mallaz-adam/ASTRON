import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    ...(mode === 'test' ? [] : [VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'ASTRON',
        short_name: 'ASTRON',
        description: 'A calm atlas of the sky.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#E9DBBB',
        background_color: '#E9DBBB',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,jpeg,woff2,json,md}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: 'index.html',
      },
    })]),
  ],
  test: {
    // The test runner needs a real Windows path for public SVG raw imports.
    alias: { '/art': fileURLToPath(new URL('./public/art', import.meta.url)).replace(/\\/g, '/') },
    // Forked processes let clock tests change TZ without affecting other tests.
    pool: 'forks',
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}));
