import { test, expect } from "@playwright/test";

test.describe("Smoke: トップページ到達性", () => {
  test("トップページが HTTP 200 で描画される", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    // タイトル文言自体は検証しない（変更で無関係に落ちるのを避ける）
    await expect(page).toHaveTitle(/.+/);
  });
});
