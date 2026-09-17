import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        expertise: resolve(import.meta.dirname, 'expertise.html'),
        services: resolve(import.meta.dirname, 'services.html'),
        work: resolve(import.meta.dirname, 'work.html'),
        experience: resolve(import.meta.dirname, 'experience.html'),
        adminDashboard: resolve(import.meta.dirname, 'admin/dashboard.html'),
        adminLogin: resolve(import.meta.dirname, 'admin/login.html')
      }
    }
  }
});
