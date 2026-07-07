import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // ローカルはリトライ 0。リトライで「たまたま通る」フレークを握りつぶさないため
  retries: process.env.CI ? 2 : 0,
  // CI ランナーは低コア。既定（コア数）ワーカーだと奪い合ってかえって遅く不安定になるため絞る
  workers: process.env.CI ? 2 : undefined,
  // html は自動で開かない。開くと CI がプロンプト待ちで固まるため
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "https://practicesoftwaretesting.com",
    // 既定の data-testid ではなく、このサイトが採用している data-test を getByTestId の参照先にする
    testIdAttribute: "data-test",
    // trace: "on" だと成功時も収集してオーバーヘッド。失敗の初回リトライ時だけに限定する
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
