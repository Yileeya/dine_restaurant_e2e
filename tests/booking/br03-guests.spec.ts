import { test, expect } from '../../src/fixtures';

test.beforeEach(async ({ bookingPage }) => {
    await bookingPage.open();
});

test('[TC-03-1] 人數為 1 時停用 −', { tag: ['@BR-03', '@P1'] }, async ({ bookingPage }) => {
    await expect(bookingPage.guests).toHaveText('1');
    await expect(bookingPage.guestsMinus).toBeDisabled();
});

test('[TC-03-2] 人數為 10 時停用 +', { tag: ['@BR-03', '@P1'] }, async ({ bookingPage }) => {
    for (let i = 0; i < 9; i++) {
        await bookingPage.guestsPlus.click();
    }

    await expect(bookingPage.guests).toHaveText('10');
    await expect(bookingPage.guestsPlus).toBeDisabled();
});
