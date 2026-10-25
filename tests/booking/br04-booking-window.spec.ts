import { test, expect } from '@playwright/test';
import { dPlus } from '../../src/utils/dates';

test('[TC-04-1] 日期可選範圍', { tag: ['@BR-04', '@P2'] }, async ({ page }) => {
  await page.goto('/');

  const date = page.getByTestId('date');
  await expect(date).toHaveAttribute('min', dPlus(1));
  await expect(date).toHaveAttribute('max', dPlus(30));
});
