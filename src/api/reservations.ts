// 受測系統的 API。測試用它準備與清除前置資料，不經過畫面。
import { APIRequestContext, expect } from '@playwright/test';

export const SLOTS = ['11:30', '12:30', '17:30', '18:30'] as const;
export type Slot = (typeof SLOTS)[number];
export const SLOT_CAPACITY = 20; // BR-06
export const MAX_GUESTS = 10; // BR-03：單筆上限

export type ReservationInput = { name: string; phone: string; date: string; slot: Slot; guests: number };
export type Reservation = ReservationInput & { id: number };

/** 查詢某天各時段的剩餘名額 */
export async function getAvailability(request: APIRequestContext, date: string) {
  const res = await request.get('/api/availability', { params: { date } });
  expect(res.status(), await res.text()).toBe(200);
  const body = await res.json();
  return body.slots as { slot: Slot; remaining: number }[];
}

/** 經由公開 API 建立預約 */
export async function createReservation(request: APIRequestContext, input: ReservationInput) {
  const res = await request.post('/api/reservations', { data: input });
  expect(res.status(), await res.text()).toBe(201);
  return (await res.json()) as Reservation;
}

/** 後台 API：查詢與刪除預約，需先登入 */
export class AdminApi {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly token: string,
  ) {}

  static async login(request: APIRequestContext) {
    const res = await request.post('/api/admin/login', {
      data: { username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS },
    });
    expect(res.status(), '後台登入失敗：請確認 .env 的 ADMIN_USER、ADMIN_PASS').toBe(200);
    const { token } = await res.json();
    return new AdminApi(request, token);
  }

  /** 以姓名或電話關鍵字搜尋 */
  async search(q: string) {
    const res = await this.request.get('/api/admin/reservations', {
      params: { q },
      headers: { Authorization: `Bearer ${this.token}` },
    });
    expect(res.status(), await res.text()).toBe(200);
    const body = await res.json();
    return body.items as Reservation[];
  }

  async remove(id: number) {
    const res = await this.request.delete(`/api/admin/reservations/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    expect(res.status(), await res.text()).toBe(204);
  }
}
