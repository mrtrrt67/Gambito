import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@gambito/engine': path.resolve(__dirname, '../engine/src/index.ts'),
    },
  },
  server: {
    port: 3000,
  },
});
