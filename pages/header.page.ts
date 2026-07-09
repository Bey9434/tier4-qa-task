import type { Locator, Page } from "@playwright/test";

export const cartLink = (page: Readonly<Page>): Locator =>
  page.getByRole("link", { name: "cart" });

// カート追加時にトースト通知は無く、ヘッダーの件数バッジが唯一の観測可能な成功シグナル
export const cartQuantityBadge = (page: Readonly<Page>): Locator =>
  page.getByTestId("cart-quantity");
