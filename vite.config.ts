import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    // Cho phép gán cổng qua biến môi trường PORT (chạy song song nhiều phiên dev);
    // mặc định giữ 5180 như trước.
    port: Number(process.env.PORT) || 5180,
  },
});
