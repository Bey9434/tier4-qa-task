import { test, expect } from "@playwright/test";
import { gotoHome, productLinkByName } from "../pages/home.page";
import { addToCartButton } from "../pages/product.page";
import { cartLink, cartQuantityBadge } from "../pages/header.page";
import {
  cartTotal,
  proceedFromCart,
  proceedFromSignInToAddress,
  proceedFromAddress,
  alreadyLoggedInMessage,
  signIn,
  fillAddress,
  streetInput,
  cityInput,
  stateInput,
  selectPaymentMethod,
  confirmButton,
  paymentSuccessMessage,
  orderConfirmationMessage,
} from "../pages/checkout.page";
import type { AddressInput } from "../pages/checkout.page";
import { registerAccount } from "../config/account";
import { STABLE_PRODUCT_NAME } from "../config/test-data";

// 自動補完(street/city/state)のトリガーになる3項目のみ入力する
const addressInput: AddressInput = {
  country: "Germany",
  postalCode: "10115",
  houseNumber: "1",
};

// アプリが郵便番号から生成する架空の住所。注文確定 API がこの値を照合するため変更しない
const expectedAutoFill = {
  street: "Eckertplatz",
  city: "Heidenheim an der Brenz",
  state: "Rheinland-Pfalz",
} as const;

test.describe("TC-002: 商品購入ジャーニー", () => {
  test("TC-002: ゲストで商品を選びチェックアウト内サインインを経て注文を完了する", async ({
    page,
    request,
  }) => {
    const account = await registerAccount(request);

    await test.step("Arrange: ホームから商品詳細へ遷移する", async () => {
      await gotoHome(page);
      await productLinkByName(page, STABLE_PRODUCT_NAME).click();
    });

    await test.step("Act & Assert: カートに追加する", async () => {
      await addToCartButton(page).click();
      await expect(cartQuantityBadge(page)).toHaveText("1");
    });

    await test.step("Act & Assert: カートを確認しチェックアウトへ進む", async () => {
      await cartLink(page).click();
      await expect(cartTotal(page)).toBeVisible();
      await proceedFromCart(page).click();
    });

    await test.step("Act & Assert: チェックアウト内でサインインする", async () => {
      await signIn(page, account.email, account.password);
      await expect(alreadyLoggedInMessage(page)).toBeVisible();
      await proceedFromSignInToAddress(page);
    });

    await test.step("Act: 国・郵便番号・番地を入力する", async () => {
      await fillAddress(page, addressInput);
    });

    await test.step("Assert: アプリが street/city/state を自動補完する", async () => {
      await expect(streetInput(page)).toHaveValue(expectedAutoFill.street);
      await expect(cityInput(page)).toHaveValue(expectedAutoFill.city);
      await expect(stateInput(page)).toHaveValue(expectedAutoFill.state);
      await proceedFromAddress(page).click();
    });

    await test.step("Act & Assert: 支払い方法を選択し注文を確定する", async () => {
      await selectPaymentMethod(page, "Cash on Delivery");
      // 1回目: 支払い検証のみ（注文はまだ作られない）
      await confirmButton(page).click();
      await expect(paymentSuccessMessage(page)).toHaveText(
        "Payment was successful",
      );
      // 2回目: 注文作成（非冪等のためリトライ禁止）
      await confirmButton(page).click();
      await expect(orderConfirmationMessage(page)).toContainText(
        "Thanks for your order! Your invoice number is",
        { timeout: 15000 },
      );
    });
  });
});
