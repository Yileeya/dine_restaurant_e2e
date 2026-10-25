import { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures';
import { SlotTarget, TestData } from '../../src/fixtures/testData';

// 規格書的前置資料「D+3 12:30 已有 15 人」：受測網站可能有其他訂單，改為自動找一個空時段再塞到 15 人
async function bookViaUi(page: Page, testData: TestData, target: SlotTarget, guests: number) {
  await page.goto('/');
  await page.getByTestId('name').fill(testData.name());
  await page.getByTestId('phone').fill(testData.phone());
  await page.getByTestId('date').fill(target.date);
  await page.getByTestId(`slot-${target.slot}`).getByRole('radio').check();
  for (let i = 1; i < guests; i++) {
    await page.getByTestId('guests-plus').click();
  }
  await expect(page.getByTestId('guests')).toHaveText(String(guests));
  await page.getByTestId('submit').click();
}

test('[TC-06-1] 剛好訂滿', { tag: ['@BR-06', '@P1'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));

  await test.step('訂 5 人', () => bookViaUi(page, testData, target, 5));
  // 成功區塊一開始就在網頁裡（隱藏），必須先確認它顯示出來，才代表預約真的完成
  await expect(page.getByTestId('success')).toBeVisible();
  await expect(page.getByTestId('success')).toContainText('Reservation confirmed');

  await test.step('該時段變為 Full', async () => {
    await page.goto('/');
    await page.getByTestId('date').fill(target.date);
    await expect(page.getByTestId(`slot-${target.slot}-remaining`)).toHaveText('Full');
  });
});

test('[TC-06-2] 超過上限 1 人', { tag: ['@BR-06', '@P1'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));
  const countBefore = await testData.countMine();

  await test.step('訂 6 人', () => bookViaUi(page, testData, target, 6));
  await expect(page.getByTestId('form-error')).toHaveText('Only 5 seats left for this time');
  expect(await testData.countMine(), '資料庫筆數不變').toBe(countBefore);
});
