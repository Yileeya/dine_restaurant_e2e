// 執行前先清除上次中斷而殘留的測試資料。
// 只刪除建立超過 1 小時的，避免刪到其他人此刻正在執行的測試資料。
import { FullConfig, request } from '@playwright/test';
import { AdminApi } from './api/reservations';
import { TEST_DATA_PREFIX } from './fixtures/testData';

const STALE_AFTER_MS = 60 * 60 * 1000;

export default async function globalSetup(config: FullConfig) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) return;

  const context = await request.newContext({ baseURL: config.projects[0].use.baseURL });
  const admin = await AdminApi.login(context);
  const cutoff = Date.now() - STALE_AFTER_MS;

  for (const reservation of await admin.search(TEST_DATA_PREFIX)) {
    const createdAt = Number(reservation.name.slice(TEST_DATA_PREFIX.length).split('-')[0]);
    if (reservation.name.startsWith(TEST_DATA_PREFIX) && createdAt < cutoff) {
      await admin.remove(reservation.id);
    }
  }
  await context.dispose();
}
