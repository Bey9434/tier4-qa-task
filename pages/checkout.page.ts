import type { Locator, Page } from "@playwright/test";

// street/city/state は含めない。country/postalCode/houseNumber から
// postcode-lookup API 経由で自動補完されるため（詳細は fillAddress 参照）
export type AddressInput = {
  readonly country: string;
  readonly postalCode: string;
  readonly houseNumber: string;
};

export const cartTotal = (page: Readonly<Page>): Locator =>
  page.getByTestId("cart-total");

// 各ステップの要素が同じ DOM に共存し、同文言の「Proceed to checkout」ボタンが
// 複数あるため getByRole の名前指定では一意にならず、data-test で区別する
export const proceedFromCart = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-1");
export const proceedFromSignIn = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-2");
export const proceedFromAddress = (page: Readonly<Page>): Locator =>
  page.getByTestId("proceed-3");

// 住所ステップに入ると保存住所取得(GET /users/me)がフォームを非同期に上書きする。
// この応答を待たずに入力すると上書きで消え invalid のまま進めなくなるため、応答完了を待つ
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

// システムメッセージで role も data-test も持たないため、最後の手段として文言で取得する
export const alreadyLoggedInMessage = (page: Readonly<Page>): Locator =>
  page.getByText(/already logged in/);

// 「サインイン」と「ゲストとして進む」の両フォームが同時に DOM に存在し、両方に
// 「Email address」ラベルがあるため getByLabel は一意にならない。data-test で絞る
export const signIn = async (
  page: Readonly<Page>,
  email: string,
  password: string,
): Promise<void> => {
  await page.getByTestId("email").fill(email);
  await page.getByTestId("password").fill(password);
  await page.getByTestId("login-submit").click();
};

// 住所入力欄。<label> との関連付けが確認できなかったため data-test で取得する
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

// street/city/state は手入力しない。postal_code/house_number の入力から非同期に
// 自動補完(patchValue)されるため、手入力すると競合して一時的に invalid になりうる
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

// 同じボタンが1回目クリックで支払い検証、2回目クリックで注文作成を行う（非冪等）。
// 呼び出し側でこのクリックをリトライしない（二重注文の原因になる）
export const confirmButton = (page: Readonly<Page>): Locator =>
  page.getByRole("button", { name: "Confirm" });

export const paymentSuccessMessage = (page: Readonly<Page>): Locator =>
  page.getByTestId("payment-success-message");

export const orderConfirmationMessage = (page: Readonly<Page>): Locator =>
  page.getByText(/Thanks for your order/);
