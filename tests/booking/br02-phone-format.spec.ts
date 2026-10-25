import { test, expect } from '@playwright/test';

test('[TC-02-1] 電話格式錯誤', { tag: ['@BR-02', '@P2'] }, async ({ page }) => {
  for (const phone of ['0812345678', '091234567']) {
    await test.step(`輸入 ${phone} 後送出`, async () => {
      await page.goto('/');
      await page.getByTestId('phone').fill(phone);
      await page.getByTestId('submit').click();

      await expect(page.getByTestId('phone-error')).toHaveText('Please enter a valid phone number');
    });
  }
});
