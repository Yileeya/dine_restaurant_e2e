import { test, expect } from '../../src/fixtures';

test('[TC-05-1] 只顯示 11:30、12:30、17:30、18:30 四個時段', { tag: ['@BR-05', '@P2'] }, async ({ bookingPage }) => {
    await bookingPage.open();

    await expect(bookingPage.slotRadios).toHaveCount(4);
    await expect(bookingPage.slotOption('11:30')).toBeVisible();
    await expect(bookingPage.slotOption('12:30')).toBeVisible();
    await expect(bookingPage.slotOption('17:30')).toBeVisible();
    await expect(bookingPage.slotOption('18:30')).toBeVisible();
});
