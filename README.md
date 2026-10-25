# dine_restaurant_e2e

餐廳預約系統的端對端（E2E）自動化測試。以 Playwright + TypeScript 實作，測試案例由規格書驅動，每一支測試都能追溯到一條業務規則。

| 項目 | 內容 |
|---|---|
| 規格書 | [`docs/規格書_v1.xlsx`](docs/規格書_v1.xlsx)：Rules 12 條、TestCases 22 個 |
| 測試產出 | Playwright HTML Report |

## 追溯模型

規格書是唯一依據。規則 ID 建立後永不變更，測試案例引用規則 ID，測試程式再引用測試案例 ID：

```
Rules        TestCases      Playwright                                       Report
BR-06  ───▶  TC-06-2  ───▶  test('[TC-06-2] …', { tag: ['@BR-06', '@P1'] })  ───▶  HTML Report
```

- 報表中任一失敗都能由 TC ID 對回規格書，得知違反的是哪一條規則。
- 規格書中的日期以 `D+n` 表示（D = 執行當天），測試於執行時換算，避免案例隨日期失效。

## 技術組成

| 元件 | 版本／選擇 | 說明 |
|---|---|---|
| Runtime | Node.js 24 | |
| Test runner | `@playwright/test` 1.64.1 | `.npmrc` 設定 `save-exact=true`，套件一律固定版本 |
| 瀏覽器 | Chromium（Desktop Chrome） | 單一瀏覽器，見「執行設定」 |
| 語言 | TypeScript | |
| 環境變數 | dotenv | |

## 快速開始

```bash
npm install
npx playwright install chromium
cp .env.example .env    # 填入 BASE_URL、ADMIN_USER、ADMIN_PASS
npm test
```

## 常用指令

| 指令 | 用途 |
|---|---|
| `npm test` | 執行全部測試 |
| `npm run test:ui` | UI 模式，逐步檢視與除錯 |
| `npm run report` | 開啟最近一次的 HTML 報表 |
| `npx playwright test --grep @BR-06` | 只跑某條規則的測試 |
| `npx playwright test --grep @P1` | 只跑 P1 優先級的測試 |
| `npx playwright test --grep "TC-06-2"` | 只跑單一測試案例 |

## 設定

### 環境變數

| 變數 | 必填 | 說明 |
|---|---|---|
| `BASE_URL` | 是 | 受測系統網址；未設定時測試直接中止 |
| `ADMIN_USER` | 後台測試 | 管理員帳號 |
| `ADMIN_PASS` | 後台測試 | 管理員密碼 |

本機由 `.env` 提供（已列入 `.gitignore`，不進版控），`.env.example` 為範本。CI 環境改由 Secrets 注入。

### 執行設定（`playwright.config.ts`）

| 設定 | 值 | 理由 |
|---|---|---|
| 瀏覽器 | 僅 Chromium | 功能驗證不重複跑三種引擎，縮短回饋時間 |
| 時區 | `Asia/Taipei` | 受測系統以台灣時間判定「當日」，BR-04 的可預約區間依此計算；避免 CI 主機時區不同造成日期誤判 |
| 執行紀錄 | screenshot `only-on-failure`、video／trace `on` | 每支測試都保留影片與 trace，可回放完整操作；失敗時另存截圖。可用值見設定檔註解 |
| 重試 | CI 2 次、本機 0 次 | 本機失敗立即暴露；CI 吸收偶發的網路波動 |
| `forbidOnly` | CI 開啟 | 防止誤留 `test.only` 導致 CI 只跑部分測試 |
| Reporter | `list` ＋ `html`（不自動開啟） | 終端機逐條輸出，同時產生 HTML 報表 |

## 撰寫規範

| 項目 | 規範 | 範例 |
|---|---|---|
| 測試檔 | 依功能分資料夾，一條規則一個檔 | `tests/booking/br06-slot-capacity.spec.ts` |
| 測試名稱 | 以 TC ID 開頭 | `[TC-06-2] 時段剩 5 位時訂 6 人應失敗` |
| 標籤 | 規則 ID ＋ 規格書優先級 | `@BR-06`、`@P1` |
| 選擇器 | 見下方「選擇器優先順序」 | |

### 選擇器優先順序

依穩定度由高到低選用。多數受測系統未提供 `data-testid`，此時從第 2 項開始：

1. **測試專用屬性**：`getByTestId`。前後端共同約定的穩定介面，受測系統有提供時優先採用。
2. **使用者看得到的語意**：`getByRole`、`getByLabel`、`getByPlaceholder`、`getByText`。與使用者的操作方式一致，畫面改版時最不容易失效。
3. **穩定的 CSS 屬性**：`id`、`name`、`type`、`aria-*` 等語意屬性，例如 `input[name="phone"]`。
4. **最後手段**：CSS class 或 DOM 階層。只用語意明確的 class，避開框架自動產生的 class（如 `css-1x2y3z`）與 `nth-child` 這類位置選擇；採用時集中管理，改版時只改一處。

## 專案結構

```
dine_restaurant_e2e/
├─ docs/
│  └─ 規格書_v1.xlsx        規格書
├─ tests/
│  ├─ booking/              前台預約（一條規則一個檔）
│  ├─ admin/                後台：登入、篩選、刪除
│  ├─ api/                  直接呼叫 API，驗證後端規則
│  └─ auth.setup.ts         後台登入一次，存下登入狀態供後台測試使用
├─ src/
│  ├─ api/                  受測系統 API：準備與清除前置資料
│  ├─ fixtures/             測試共用的準備與收尾（測試資料自建自清、後台登入狀態）
│  ├─ utils/                共用工具：D+n 日期換算
│  └─ global-setup.ts       執行前清除中斷殘留的測試資料
├─ CLAUDE.md                AI 協作規則
├─ playwright.config.ts     執行設定
├─ .env.example             環境變數範本
├─ .npmrc                   固定套件版本
└─ package.json
```

結構隨實作擴充，新增資料夾時同步更新本節。
