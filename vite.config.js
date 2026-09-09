import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        expertise: resolve(__dirname, 'expertise.html'),
        services: resolve(__dirname, 'services.html'),
        work: resolve(__dirname, 'work.html'),
        experience: resolve(__dirname, 'experience.html'),
        adminDashboard: resolve(__dirname, 'admin/dashboard.html'),
        adminLogin: resolve(__dirname, 'admin/login.html')
      }
    }
  }
});
