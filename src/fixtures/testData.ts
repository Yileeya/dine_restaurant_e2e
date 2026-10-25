// 測試資料：每支測試自己建立前置資料，結束後（無論成敗）只清除自己建立的資料。
import { APIRequestContext, TestInfo } from '@playwright/test';
import { AdminApi, MAX_GUESTS, SLOT_CAPACITY, SLOTS, Slot, createReservation, getAvailability } from '../api/reservations';
import { dPlus } from '../utils/dates';

/** 測試資料的姓名一律以此開頭，清除時只認這個前綴 */
export const TEST_DATA_PREFIX = 'E2E-';

export type SlotTarget = { date: string; slot: Slot };

export class TestData {
  /** 本支測試專屬的標記，格式 E2E-<建立時間>-<執行序號> */
  readonly marker: string;
  private readonly usedPhones = new Set<string>();

  constructor(
    private readonly request: APIRequestContext,
    private readonly admin: AdminApi,
    private readonly testInfo: TestInfo,
  ) {
    this.marker = `${TEST_DATA_PREFIX}${Date.now()}-${testInfo.parallelIndex}`;
  }

  /** 帶有標記的姓名 */
  name() {
    return `${this.marker} Guest`;
  }

  /** 本支測試內不重複的合法電話（09 開頭共 10 碼） */
  phone() {
    let phone: string;
    do {
      phone = '09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
    } while (this.usedPhones.has(phone));
    this.usedPhones.add(phone);
    return phone;
  }

  /**
   * 從最晚可預約日（D+30）往前，找一個完全沒有訂單的時段。
   * 同時執行的測試各自分配不同的候選時段，避免互相搶同一個時段。
   */
  async findEmptySlot(options: { excludeDate?: string } = {}): Promise<SlotTarget> {
    const workers = this.testInfo.config.workers;
    const mine = this.testInfo.parallelIndex;
    let index = 0;
    for (let n = 30; n >= 1; n--) {
      const date = dPlus(n);
      const candidates = SLOTS.filter(() => index++ % workers === mine);
      if (!candidates.length || date === options.excludeDate) continue;
      const availability = await getAvailability(this.request, date);
      const empty = candidates.find((slot) => availability.find((a) => a.slot === slot)?.remaining === SLOT_CAPACITY);
      if (empty) return { date, slot: empty };
    }
    throw new Error('D+1～D+30 找不到完全沒有訂單的時段');
  }

  /** 在指定時段塞入共 guests 人的前置訂單；每筆上限 10 人，超過就拆成多筆 */
  async seed(target: SlotTarget, guests: number) {
    for (let left = guests; left > 0; left -= MAX_GUESTS) {
      await createReservation(this.request, {
        name: this.name(),
        phone: this.phone(),
        ...target,
        guests: Math.min(left, MAX_GUESTS),
      });
    }
  }

  /** 用指定電話建立一筆前置訂單，例如「某電話已訂該時段」 */
  async seedReservation(target: SlotTarget, phone: string, guests = 1) {
    await createReservation(this.request, { name: this.name(), phone, ...target, guests });
  }

  /** 目前資料庫裡，本支測試建立的訂單筆數 */
  async countMine() {
    return (await this.admin.search(this.marker)).length;
  }

  /** 刪除本支測試建立的所有訂單 */
  async cleanup() {
    for (const reservation of await this.admin.search(this.marker)) {
      await this.admin.remove(reservation.id);
    }
  }
}
