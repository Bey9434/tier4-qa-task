import type { Locator, Page } from "@playwright/test";
import { PATHS } from "./paths";

// <label for> があるため getByLabel で取れる（data-test でなくユーザーが見るラベルで検証したい）
export const emailInput = (page: Readonly<Page>): Locator =>
  page.getByLabel("Email address");
// 部分一致だと「Forgot your Password?」リンクの aria-label にも "Password" が含まれ衝突するため、
// label の実文言「Password *」で厳密一致させる
export const passwordInput = (page: Readonly<Page>): Locator =>
  page.getByLabel("Password *", { exact: true });

export const loginButton = (page: Readonly<Page>): Locator =>
  page.getByRole("button", { name: "Login" });

// パスワード表示切替ボタンは aria-label/data-test が無く一意に取得できない。
// raw locator は eslint 規約で禁止のため、この補助シナリオは対象外とする

// 動的生成の div で role/label を持たないため data-test で取得する
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
