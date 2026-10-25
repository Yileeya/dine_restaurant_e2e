import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// 讀取 .env；CI 上沒有 .env，改由 GitHub Secrets 提供
dotenv.config({ quiet: true });

if (!process.env.BASE_URL) {
  throw new Error('缺少 BASE_URL：請把 .env.example 複製成 .env 並填好');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // list：終端機逐條列出；html：產生報表但不自動開啟
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL,
    // 網站以台灣時間判斷「今天」，瀏覽器也要用台灣時間
    timezoneId: 'Asia/Taipei',
    // 失敗時才留下截圖、影片、trace，報表一打開就看得到失敗畫面
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  // 只測 Chromium
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
