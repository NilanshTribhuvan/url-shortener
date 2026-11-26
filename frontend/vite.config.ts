import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The Spring backend has no CORS config, so in dev we proxy API calls through
// Vite. The browser only ever talks to one origin, and no backend change is needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const backend = env.VITE_BACKEND_URL || 'http://localhost:8080';
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': backend, '/health': backend },
    },
    test: { environment: 'node' },
  };
});
