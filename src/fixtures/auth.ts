// 後台登入狀態的存放位置。由 tests/auth.setup.ts 登入一次後寫入，後台測試以 test.use({ storageState }) 載入。
// 檔案內含登入憑證，所在資料夾已列入 .gitignore，不得進版控。
export const ADMIN_STORAGE_STATE = 'playwright/.auth/admin.json';
