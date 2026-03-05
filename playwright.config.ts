import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: 'npx ts-node src/api/start.ts',
      port: 3000,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npx vite --port 5173',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
