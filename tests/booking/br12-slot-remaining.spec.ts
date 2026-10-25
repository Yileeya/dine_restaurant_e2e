import { test, expect } from '../../src/fixtures';

// 規格書的「D+3 17:30」「D+3 12:30」：改用自動找到的空時段，避免碰到真實訂單
test('[TC-12-1] 額滿時段停用', { tag: ['@BR-12', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 20 人', () => testData.seed(target, 20));

  await page.goto('/');
  await page.getByTestId('date').fill(target.date);

  await expect(page.getByTestId(`slot-${target.slot}-remaining`)).toHaveText('Full');
  await expect(page.getByTestId(`slot-${target.slot}`).getByRole('radio')).toBeDisabled();
});

test('[TC-12-2] 剩餘名額顯示', { tag: ['@BR-12', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));

  await page.goto('/');
  await page.getByTestId('date').fill(target.date);

  await expect(page.getByTestId(`slot-${target.slot}-remaining`)).toHaveText('5 left');
});
