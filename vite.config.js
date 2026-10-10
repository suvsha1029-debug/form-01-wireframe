import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
export default defineConfig({
  base: '/form-01-wireframe/',
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
});
