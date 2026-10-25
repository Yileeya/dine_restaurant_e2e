// 規格書以 D+n 表示日期（D = 執行當天）。受測系統以台灣時間判定「當天」，這裡用同一個基準換算。
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 回傳台灣時間 D+n 的日期字串，格式 YYYY-MM-DD */
export function dPlus(n: number): string {
  const taipeiNow = new Date(Date.now() + TAIPEI_OFFSET_MS);
  taipeiNow.setUTCDate(taipeiNow.getUTCDate() + n);
  return taipeiNow.toISOString().slice(0, 10);
}
