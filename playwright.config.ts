import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// 讀取 .env；CI 上沒有 .env，改由 GitHub Secrets 提供
dotenv.config({ quiet: true });

if (!process.env.BASE_URL) {
  throw new Error('缺少 BASE_URL：請把 .env.example 複製成 .env 並填好');
}

export default defineConfig({
  testDir: './tests',
  // 執行前清除上次中斷殘留的測試資料
  globalSetup: './src/global-setup.ts',
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
    // 截圖可用值：
    //   'off'              不截圖
    //   'on'               每支測試結束都截圖
    //   'only-on-failure'  失敗才截圖
    //   'on-first-failure' 只截第一次失敗（搭配重試時，重跑不再截）
    screenshot: 'only-on-failure',

    // 影片與 trace 可用值相同：
    //   'off'                           不錄
    //   'on'                            每支都錄，通過也保留（示範、除錯用；報表會變大）
    //   'retain-on-failure'             每支都錄，只保留失敗的
    //   'retain-on-first-failure'       只保留第一次失敗的
    //   'retain-on-failure-and-retries' 保留失敗的，以及之後每次重試的
    //   'on-first-retry'                只在第一次重試時錄（本機 retries 為 0，不會觸發）
    //   'on-all-retries'                每次重試都錄
    video: 'on',
    trace: 'on',
  },
  projects: [
    // 先登入後台一次，存下登入狀態供後台測試使用
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    // 只測 Chromium
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
  ],
});
