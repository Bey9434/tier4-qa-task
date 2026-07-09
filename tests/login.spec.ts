import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  gotoLoginPage,
  login,
  emailError,
  passwordError,
  loginError,
} from "../pages/login.page";
import { pageHeading } from "../pages/account.page";
import { LOGIN_ERROR_MESSAGES, MY_ACCOUNT_HEADING } from "../pages/locator";
import { PATHS } from "../pages/paths";
import { registerAccount } from "../config/account";
import type { Account } from "../config/account";

// シナリオごとの期待結果（画面遷移・エラー表示・エラー非表示）を検証する
const expectAccountPageDisplayed = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(page).toHaveURL(new RegExp(`${PATHS.ACCOUNT}$`));
  await expect(pageHeading(page)).toHaveText(MY_ACCOUNT_HEADING);
};

const expectInvalidCredentials = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(loginError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.invalidCredentials,
  );
};

const expectPasswordRequired = async (page: Readonly<Page>): Promise<void> => {
  await expect(passwordError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.passwordRequired,
  );
};

const expectPasswordLengthInvalid = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(passwordError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.passwordLengthInvalid,
  );
};

// 長さ検証を通過しサーバまで到達したことを認証エラー表示で確認する
const expectNoPasswordLengthError = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(passwordError(page)).toBeHidden();
  await expect(loginError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.invalidCredentials,
  );
};

const expectEmailRequired = async (page: Readonly<Page>): Promise<void> => {
  await expect(emailError(page)).toHaveText(LOGIN_ERROR_MESSAGES.emailRequired);
};

const expectEmailFormatInvalid = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(emailError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.emailFormatInvalid,
  );
};

// 形式検証を通過しサーバまで到達したことを認証エラー表示で確認する
const expectNoEmailFormatError = async (
  page: Readonly<Page>,
): Promise<void> => {
  await expect(emailError(page)).toBeHidden();
  await expect(loginError(page)).toHaveText(
    LOGIN_ERROR_MESSAGES.invalidCredentials,
  );
};

type Scenario = {
  readonly id: number;
  readonly description: string;
  readonly email: (account: Account) => string;
  readonly password: (account: Account) => string;
  readonly assertOutcome: (page: Readonly<Page>) => Promise<void>;
};

const scenarios: readonly Scenario[] = [
  {
    id: 1,
    description: "正常系: 正しい認証情報でログインできる",
    email: (a) => a.email,
    password: (a) => a.password,
    assertOutcome: expectAccountPageDisplayed,
  },
  {
    id: 2,
    description: "誤ったパスワード",
    email: (a) => a.email,
    password: () => "wrong-password",
    assertOutcome: expectInvalidCredentials,
  },
  {
    id: 3,
    description: "パスワード空欄",
    email: (a) => a.email,
    password: () => "",
    assertOutcome: expectPasswordRequired,
  },
  {
    id: 4,
    description: "パスワード境界値: 2文字（無効）",
    email: (a) => a.email,
    password: () => "ab",
    assertOutcome: expectPasswordLengthInvalid,
  },
  {
    id: 5,
    description: "パスワード境界値: 3文字（長さ検証は通過）",
    email: (a) => a.email,
    password: () => "abc",
    assertOutcome: expectNoPasswordLengthError,
  },
  {
    id: 6,
    description: "メール空欄",
    email: () => "",
    password: (a) => a.password,
    assertOutcome: expectEmailRequired,
  },
  {
    id: 7,
    description: "メール形式不正: 1文字",
    email: () => "a",
    password: (a) => a.password,
    assertOutcome: expectEmailFormatInvalid,
  },
  {
    id: 8,
    description: "メール形式不正: @と特殊文字",
    email: () => "a@@invalid!!.com",
    password: (a) => a.password,
    assertOutcome: expectEmailFormatInvalid,
  },
  {
    id: 9,
    description: "メール境界値: @+1文字（形式検証は通過）",
    email: () => "a@b",
    password: (a) => a.password,
    assertOutcome: expectNoEmailFormatError,
  },
];

test.describe("TC-001: ログイン", () => {
  for (const scenario of scenarios) {
    test(`TC-001 #${scenario.id}: ${scenario.description}`, async ({
      page,
      request,
    }) => {
      const account = await registerAccount(request);

      await test.step("Arrange: ログインページを開く", async () => {
        await gotoLoginPage(page);
      });

      await test.step("Act: シナリオの入力値でログインを試みる", async () => {
        await login(page, scenario.email(account), scenario.password(account));
      });

      await test.step("Assert: シナリオごとの期待結果を確認する", async () => {
        await scenario.assertOutcome(page);
      });
    });
  }
});
