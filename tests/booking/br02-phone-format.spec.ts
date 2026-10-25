import { test, expect } from '../../src/fixtures';

test('[TC-02-1] 電話格式錯誤', { tag: ['@BR-02', '@P2'] }, async ({ bookingPage }) => {
  for (const phone of ['0812345678', '091234567']) {
    await test.step(`輸入 ${phone} 後送出`, async () => {
      await bookingPage.open();
      await bookingPage.phone.fill(phone);
      await bookingPage.submit.click();

      await expect(bookingPage.fieldError('phone')).toHaveText('Please enter a valid phone number');
    });
  }
});
