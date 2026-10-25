// 前台預約頁的操作說明書：測試只說「要做什麼」，畫面上點哪裡集中寫在這裡。
// 畫面改版時，只要改這個檔案。
import { Locator, Page, expect } from '@playwright/test';
import { Slot } from '../api/reservations';

export type BookingInput = { name: string; phone: string; date: string; slot: Slot; guests?: number };
type Field = 'name' | 'phone' | 'date' | 'slot';

export class BookingPage {
  readonly name: Locator;
  readonly phone: Locator;
  readonly date: Locator;
  readonly slotRadios: Locator;
  readonly guests: Locator;
  readonly guestsMinus: Locator;
  readonly guestsPlus: Locator;
  readonly submit: Locator;
  readonly formError: Locator;
  readonly success: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('name');
    this.phone = page.getByTestId('phone');
    this.date = page.getByTestId('date');
    this.slotRadios = page.getByTestId('slots').getByRole('radio');
    this.guests = page.getByTestId('guests');
    this.guestsMinus = page.getByTestId('guests-minus');
    this.guestsPlus = page.getByTestId('guests-plus');
    this.submit = page.getByTestId('submit');
    this.formError = page.getByTestId('form-error');
    this.success = page.getByTestId('success');
  }

  async open() {
    await this.page.goto('/');
  }

  /** 欄位下方的錯誤訊息 */
  fieldError(field: Field) {
    return this.page.getByTestId(`${field}-error`);
  }

  /** 時段按鈕（含時間與剩餘名額文字） */
  slotOption(slot: Slot) {
    return this.page.getByTestId(`slot-${slot}`);
  }

  slotRadio(slot: Slot) {
    return this.slotOption(slot).getByRole('radio');
  }

  /** 時段下方的剩餘名額文字，例如「5 left」「Full」 */
  slotRemaining(slot: Slot) {
    return this.page.getByTestId(`slot-${slot}-remaining`);
  }

  /** 選日期；選完後各時段會載入剩餘名額 */
  async pickDate(date: string) {
    await this.date.fill(date);
  }

  /** 從預設的 1 人按 + 調到指定人數 */
  async setGuests(count: number) {
    for (let i = 1; i < count; i++) {
      await this.guestsPlus.click();
    }
    await expect(this.guests).toHaveText(String(count));
  }

  /** 填好整張表單，但還不送出 */
  async fill(input: BookingInput) {
    await this.name.fill(input.name);
    await this.phone.fill(input.phone);
    await this.pickDate(input.date);
    await this.slotRadio(input.slot).check();
    if (input.guests) await this.setGuests(input.guests);
  }

  /** 打開預約頁、填好表單並送出 */
  async book(input: BookingInput) {
    await this.open();
    await this.fill(input);
    await this.submit.click();
  }

  /** 確認預約成功。成功區塊一開始就在網頁裡（隱藏），必須先確認它顯示出來 */
  async expectConfirmed() {
    await expect(this.success).toBeVisible();
    await expect(this.success).toContainText('Reservation confirmed');
  }
}
