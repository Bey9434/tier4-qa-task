import { expect } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

export type Account = { readonly email: string; readonly password: string };

// 登録 API はパスワードに漏洩チェック(uncompromised)をかける。ランダム生成すると稀に
// 該当し 422 で非決定的に失敗するため、固定の強力値を使い一意性はメールだけで担保する
const REGISTER_PASSWORD = "Aa1!aA2@bStrongPw";
const API_URL = process.env.API_URL ?? "http://localhost:8091";

// 失敗系ログインテストの繰り返しで共有アカウントがロックされ他テストが巻き添えで
// 落ちるため、テストごとに専用アカウントを API で登録する（UI 操作は検証対象外）
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
  // no-throw-statements 規約のため throw でなく expect で失敗させる
  expect(
    response.ok(),
    `アカウント登録に失敗 (status ${response.status()})`,
  ).toBeTruthy();
  return { email, password: REGISTER_PASSWORD };
};
