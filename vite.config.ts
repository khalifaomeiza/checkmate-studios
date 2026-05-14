import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig(({ mode }) => {
  loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      // vite-imagetools — generates AVIF / WebP / fallback PNG variants at
      // multiple widths for every `?as=picture` import under src/assets.
      // Any import without a query string is left untouched.
      imagetools({
        defaultDirectives: (url) => {
          // Apply automatic responsive picture generation to assets in
          // src/assets/works and src/assets/showcase. Lets us drop new
          // images into those folders without touching the plugin config.
          if (
            url.pathname.includes('/src/assets/works/') ||
            url.pathname.includes('/src/assets/showcase/')
          ) {
            const params = new URLSearchParams();
            params.set('format', 'avif;webp;png');
            params.set('w', '640;960;1280;1920');
            params.set('as', 'picture');
            return params;
          }
          return new URLSearchParams();
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== 'true'
    },
    build: {
      target: 'es2020',
      sourcemap: false
    }
  };
});
