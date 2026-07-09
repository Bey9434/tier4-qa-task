import type { Locator, Page } from "@playwright/test";
import { PATHS } from "./paths";

// data-test ではなく、ユーザーが実際に見るラベルで検証したい
export const emailInput = (page: Readonly<Page>): Locator =>
  page.getByLabel("Email address");
// 部分一致だと「Forgot your Password?」の aria-label と衝突する。実文言で厳密一致させる
export const passwordInput = (page: Readonly<Page>): Locator =>
  page.getByLabel("Password *", { exact: true });

export const loginButton = (page: Readonly<Page>): Locator =>
  page.getByRole("button", { name: "Login" });

// 動的生成の div で role も label も持たないため data-test で取得する
export const emailError = (page: Readonly<Page>): Locator =>
  page.getByTestId("email-error");
export const passwordError = (page: Readonly<Page>): Locator =>
  page.getByTestId("password-error");
export const loginError = (page: Readonly<Page>): Locator =>
  page.getByTestId("login-error");

export const gotoLoginPage = async (page: Readonly<Page>): Promise<void> => {
  await page.goto(PATHS.LOGIN);
};

export const login = async (
  page: Readonly<Page>,
  email: string,
  password: string,
): Promise<void> => {
  await emailInput(page).fill(email);
  await passwordInput(page).fill(password);
  await loginButton(page).click();
};
