import { expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

export type Account = { readonly email: string; readonly password: string };

// 登録 API はパスワードの漏洩チェックを行う。ランダム生成すると稀に該当して 422 で落ちる
const REGISTER_PASSWORD = "Aa1!aA2@bStrongPw";
const API_URL = process.env.API_URL ?? "http://localhost:8091";

// 失敗系ログインを繰り返すと共有アカウントがロックされ、他のテストが巻き添えで落ちる。
// テストごとに専用アカウントを登録して状態を共有しない
export const registerAccount = async (
  request: APIRequestContext,
): Promise<Account> => {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const response = await request.post(`${API_URL}/users/register`, {
    data: {
      first_name: "E2E",
      last_name: "Tester",
      dob: "1990-01-01",
      email,
      password: REGISTER_PASSWORD,
      address: {
        street: "Teststrasse 1",
        city: "Berlin",
        state: "Berlin",
        country: "DE",
        postal_code: "10115",
      },
    },
  });
  // eslint の no-throw-statements により throw が使えない
  expect(
    response.ok(),
    `アカウント登録に失敗 (status ${response.status()})`,
  ).toBeTruthy();
  return { email, password: REGISTER_PASSWORD };
};
