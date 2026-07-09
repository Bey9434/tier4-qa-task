import type { Locator, Page } from "@playwright/test";

// street/city/state はアプリが自動補完するため含めない
export type AddressInput = {
  readonly country: string;
  readonly postalCode: string;
  readonly houseNumber: string;
};

export const cartTotal = (page: Readonly<Page>): Locator =>
  page.getByTestId("cart-total");

// 同文言の「Proceed to checkout」ボタンが各ステップに存在する。getByRole では一意にならない
export const proceedFromCart = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-1");
export const proceedFromSignIn = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-2");
export const proceedFromAddress = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-3");

// 住所ステップの表示時に GET /users/me がフォームを非同期で上書きする。
// 応答前に入力すると値が消え、フォームが invalid のまま進めなくなる
export const proceedFromSignInToAddress = async (
  page: Readonly<Page>,
): Promise<void> => {
  const savedAddressLoaded = page.waitForResponse(
    (res) =>
      res.url().endsWith("/users/me") && res.request().method() === "GET",
  );
  await proceedFromSignIn(page).click();
  await savedAddressLoaded;
};

// role も data-test も無いため文言で取得する
export const alreadyLoggedInMessage = (page: Readonly<Page>): Locator =>
  page.getByText(/already logged in/);

// サインインとゲスト用の 2 フォームが同時に存在し、どちらにも「Email address」ラベルがある。
// getByLabel では一意にならない
export const signIn = async (
  page: Readonly<Page>,
  email: string,
  password: string,
): Promise<void> => {
  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByTestId("login-submit").click();
};

// 住所入力欄は <label> と関連付いていないため data-test で取得する
export const countrySelect = (page: Readonly<Page>): Locator =>
  page.getByTestId("country");
export const streetInput = (page: Readonly<Page>): Locator =>
  page.getByTestId("street");
export const houseNumberInput = (page: Readonly<Page>): Locator =>
  page.getByTestId("house_number");
export const cityInput = (page: Readonly<Page>): Locator =>
  page.getByTestId("city");
export const stateInput = (page: Readonly<Page>): Locator =>
  page.getByTestId("state");
export const postalCodeInput = (page: Readonly<Page>): Locator =>
  page.getByTestId("postal_code");

// street/city/state は手入力しない。postal_code と house_number から非同期に補完され、
// 手入力すると競合してフォームが invalid になる
export const fillAddress = async (
  page: Readonly<Page>,
  input: AddressInput,
): Promise<void> => {
  await countrySelect(page).selectOption({ label: input.country });
  await postalCodeInput(page).fill(input.postalCode);
  await houseNumberInput(page).fill(input.houseNumber);
};

export const paymentMethodSelect = (page: Readonly<Page>): Locator =>
  page.getByTestId("payment-method");

export const selectPaymentMethod = async (
  page: Readonly<Page>,
  method: string,
): Promise<void> => {
  await paymentMethodSelect(page).selectOption({ label: method });
};

// 同じボタンが 1 回目で支払い検証、2 回目で注文作成を行う。注文作成は非冪等なのでリトライしない
export const confirmButton = (page: Readonly<Page>): Locator =>
  page.getByRole("button", { name: "Confirm" });

export const paymentSuccessMessage = (page: Readonly<Page>): Locator =>
  page.getByTestId("payment-success-message");

export const orderConfirmationMessage = (page: Readonly<Page>): Locator =>
  page.getByText(/Thanks for your order/);
