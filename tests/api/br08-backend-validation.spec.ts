import { test, expect } from '../../src/fixtures';
import { dPlus } from '../../src/utils/dates';

// 繞過前端，直接呼叫建立預約的 API，確認後端也會擋下違規的資料。
// 送出的資料帶有 testData 的標記：萬一後端沒擋住而建立成功，測試結束後一樣會被清除。

test('[TC-08-1] API 繞過人數上限', { tag: ['@BR-08', '@P1'] }, async ({ request, testData }) => {
  const target = await testData.findEmptySlot();

  const res = await request.post('/api/reservations', {
    data: { name: testData.name(), phone: testData.phone(), ...target, guests: 11 },
  });

  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe('VALIDATION_ERROR');
  expect(await testData.countMine(), '未建立資料').toBe(0);
});

test('[TC-08-2] API 繞過日期限制', { tag: ['@BR-08', '@P1'] }, async ({ request, testData }) => {
  const res = await request.post('/api/reservations', {
    data: { name: testData.name(), phone: testData.phone(), date: dPlus(0), slot: '12:30', guests: 1 },
  });

  expect(res.status()).toBe(400);
  expect((await res.json()).error).toBe('VALIDATION_ERROR');
});

test('[TC-08-3] API 繞過容量上限', { tag: ['@BR-08', '@P1'] }, async ({ request, testData }) => {
  // 規格書的「D+3 12:30 已有 15 人」：改用自動找到的空時段
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));

  const res = await request.post('/api/reservations', {
    data: { name: testData.name(), phone: testData.phone(), ...target, guests: 6 },
  });

  expect(res.status()).toBe(409);
  expect((await res.json()).error).toBe('SLOT_FULL');
});
