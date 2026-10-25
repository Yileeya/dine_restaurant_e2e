import { test, expect } from '../../src/fixtures';
import { dPlus } from '../../src/utils/dates';

test('[TC-04-1] 日期可選範圍', { tag: ['@BR-04', '@P2'] }, async ({ bookingPage }) => {
  await bookingPage.open();

  await expect(bookingPage.date).toHaveAttribute('min', dPlus(1));
  await expect(bookingPage.date).toHaveAttribute('max', dPlus(30));
});
