import { test, expect } from "@playwright/test";

test.describe("Smoke: トップページ到達性", () => {
  test("トップページが HTTP 200 で描画される", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    // タイトル文言は固定しない。文言変更で壊れる検証を避け、非空＝描画済みだけを見る
    await expect(page).toHaveTitle(/.+/);
  });
});
