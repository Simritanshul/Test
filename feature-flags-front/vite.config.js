import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/feature-flags': 'http://localhost:5000',
    },
  },
});
