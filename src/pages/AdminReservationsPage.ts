// 後台訂單列表的操作說明書：搜尋、篩選、刪除。需在已登入狀態下使用。
import { Locator, Page } from '@playwright/test';

export class AdminReservationsPage {
  readonly rows: Locator;
  readonly deleteDialog: Locator;
  readonly deleteConfirm: Locator;
  readonly deleteCancel: Locator;
  private readonly filterDate: Locator;
  private readonly filterQuery: Locator;
  private readonly filterApply: Locator;

  constructor(private readonly page: Page) {
    this.rows = page.getByTestId('reservation-row');
    this.deleteDialog = page.getByTestId('delete-dialog');
    this.deleteConfirm = page.getByTestId('delete-confirm');
    this.deleteCancel = page.getByTestId('delete-cancel');
    this.filterDate = page.getByTestId('filter-date');
    this.filterQuery = page.getByTestId('filter-q');
    this.filterApply = page.getByTestId('filter-apply');
  }

  async open() {
    await this.page.goto('/admin/reservations');
  }

  async filterByDate(date: string) {
    await this.filterDate.fill(date);
    await this.filterApply.click();
  }

  /** 以姓名或電話搜尋 */
  async search(q: string) {
    await this.filterQuery.fill(q);
    await this.filterApply.click();
  }

  /** 含有指定文字的訂單列 */
  rowsWith(text: string) {
    return this.rows.filter({ hasText: text });
  }

  /** 每一列在某個欄位的文字，欄位依表頭順序：1 日期、2 時段、3 姓名、4 電話、5 人數 */
  async columnTexts(column: 1 | 2 | 3 | 4 | 5) {
    return this.rows.locator(`td:nth-child(${column})`).allTextContents();
  }

  /** 按下某一列的 Delete，開啟確認對話框 */
  async startDelete(row: Locator) {
    await row.getByTestId('delete-button').click();
  }
}
