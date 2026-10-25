import { test, expect } from '@playwright/test';

test('[TC-05-1] 只顯示 11:30、12:30、17:30、18:30 四個時段', { tag: ['@BR-05', '@P2'] }, async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('slots').getByRole('radio')).toHaveCount(4);
    await expect(page.getByTestId('slot-11:30')).toBeVisible();
    await expect(page.getByTestId('slot-12:30')).toBeVisible();
    await expect(page.getByTestId('slot-17:30')).toBeVisible();
    await expect(page.getByTestId('slot-18:30')).toBeVisible();
});