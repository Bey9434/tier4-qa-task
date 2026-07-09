import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // 全テストの前に DB を初期状態へ戻す（在庫枯渇などの蓄積状態をリセットする。config/global-setup.ts 参照）
  globalSetup: "./config/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 再実行は CI だけ。手元でも再実行を許すと、たまに落ちるテストが
  // 偶然通ってしまい、不安定なテストがあること自体に気付けなくなる
  retries: process.env.CI ? 2 : 0,
  // ワーカーをコア数任せにすると、多数のブラウザが同時にバックエンドを叩いて詰まり
  // 購入フローがタイムアウトするため、ローカルは 4、非力な CI ランナーは 2 に絞る
  workers: process.env.CI ? 2 : 4,
  // CI にはブラウザが無く開こうとして処理が止まるため、自動で開かない設定にする
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // 接続先は自分の PC の Docker で起動したテスト対象アプリ。公開デモサイトは
    // 世界中でアカウントを共有しており、誰かのログイン失敗でロックされうるため使わない
    baseURL: process.env.BASE_URL ?? "http://localhost:4200",
    // getByTestId が探す属性名。Playwright の既定は data-testid だが、
    // このサイトの HTML に付いているのは data-test なので合わせる
    testIdAttribute: "data-test",
    // トレース（実行過程の記録）は「失敗して再実行したとき」だけ採る。
    // 常に採ると、成功するテストの実行まで遅くなる
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
