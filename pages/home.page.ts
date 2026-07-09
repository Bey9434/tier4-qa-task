import type { Locator, Page } from "@playwright/test";
import { PATHS } from "./paths";

export const gotoHome = async (page: Readonly<Page>): Promise<void> => {
  await page.goto(PATHS.HOME);
};

// 商品名に見出し用の role が無いため getByText で取る。商品 ID は再シードで変わるので使えない
export const productLinkByName = (
  page: Readonly<Page>,
  name: string,
): Locator => page.getByText(name, { exact: true });
