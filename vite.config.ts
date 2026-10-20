import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: { main: "index.html", recovery: "auth/callback/index.html", confirmation: "auth/confirm/index.html" } } },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
