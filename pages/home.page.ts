import type { Locator, Page } from "@playwright/test";
import { PATHS } from "./paths";

export const gotoHome = async (page: Readonly<Page>): Promise<void> => {
  await page.goto(PATHS.HOME);
};

// 商品名には見出し用の role が無い。商品 ID は再シードのたびに変わる ULID なので使えず、
// 位置指定（1件目）は eslint の no-nth-methods で禁止のため、固定シードで再現される商品名を渡して辿る
export const productLinkByName = (
  page: Readonly<Page>,
  name: string,
): Locator => page.getByText(name, { exact: true });
