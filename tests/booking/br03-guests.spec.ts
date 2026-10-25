import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('[TC-03-1] 人數為 1 時停用 −', { tag: ['@BR-03', '@P1'] }, async ({ page }) => {
    await expect(page.getByTestId('guests')).toHaveText('1');
    await expect(page.getByTestId('guests-minus')).toBeDisabled();
});

test('[TC-03-2] 人數為 10 時停用 +', { tag: ['@BR-03', '@P1'] }, async ({ page }) => {
    const plus = page.getByTestId('guests-plus');

    for (let i = 0; i < 9; i++) {
        await plus.click();
    }

    await expect(page.getByTestId('guests')).toHaveText('10');
    await expect(plus).toBeDisabled();
});