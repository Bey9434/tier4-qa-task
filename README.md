# tier4-qa-task

[![E2E](https://github.com/Bey9434/tier4-qa-task/actions/workflows/e2e.yml/badge.svg)](https://github.com/Bey9434/tier4-qa-task/actions/workflows/e2e.yml)
[![Code Quality](https://github.com/Bey9434/tier4-qa-task/actions/workflows/quality.yml/badge.svg)](https://github.com/Bey9434/tier4-qa-task/actions/workflows/quality.yml)

[practice-software-testing](https://github.com/testsmith-io/practice-software-testing)（Toolshop）を対象とした E2E テスト自動化。手動テストケースの設計と、Playwright + TypeScript による自動化を含む。

テスト対象は公開デモではなく、`test-target` サブモジュールをローカル Docker で起動したものである。
公開デモは全利用者がアカウントを共有しており、他人のログイン失敗で共有アカウントがロックされると無関係のテストが巻き添えで落ちるため使わない。

## セットアップと実行

前提: Node 24、pnpm 10.28.2、Docker。
版の固定は 2 系統ある: Node は `.tool-versions`（ローカルは mise / CI は actions/setup-node の node-version-file が読む）、pnpm は `package.json` の `packageManager`（CI の pnpm/action-setup はこのフィールドしか読まない）。`.tool-versions` の pnpm はローカル用で、版を上げるときは両方を手で揃える。

`.env` は dotenvx で暗号化してコミット済み（変数の一覧は `.env.example`）。復号鍵 `.env.keys` を持っている場合は直下に置く。
鍵が無い場合は `cp .env.example .env` で平文実行できる（値はローカル起動時の既定値 localhost で機密ではない。平文で上書きした `.env` はコミットしないこと）。

```bash
git clone --recurse-submodules https://github.com/Bey9434/tier4-qa-task.git && cd tier4-qa-task
pnpm install
pnpm exec playwright install   # ブラウザ本体の取得（未取得だとテストが起動できない）
cd test-target && docker compose up -d && cd ..   # 初回はビルドで数分
pnpm test
```

`pnpm test` は dotenvx で `.env` を復号し、`globalSetup` が DB を初期シードに戻し（`migrate:fresh --seed`）商品キャッシュをクリア（`cache:clear`）してからテストを始める。
初回起動の API が本文空の 500 を返す場合は storage の所有権が原因（CI の `e2e.yml`「所有権を戻す」ステップと同じ手当てをローカルの test-target にも適用する）。

## 手動テストケース設計

### TC-001: ログイン（9 シナリオ）

`tests/login.spec.ts`。テスト専用に API 登録したアカウントを土台に、下表の入力だけを変える。

| #   | シナリオ         | 変更する入力              | 期待結果                         | 種別   |
| --- | ---------------- | ------------------------- | -------------------------------- | ------ |
| 1   | 正しい認証情報   | なし                      | `/account` へ遷移し "My account" | 正常   |
| 2   | 誤ったパスワード | pw = `wrong-password`     | "Invalid email or password"      | 異常   |
| 3   | パスワード空欄   | pw = （空）               | "Password is required"           | 異常   |
| 4   | パスワード 2 字  | pw = `ab`                 | "Password length is invalid"     | 境界値 |
| 5   | パスワード 3 字  | pw = `abc`                | 長さエラー無し + 認証エラー      | 境界値 |
| 6   | メール空欄       | mail = （空）             | "Email is required"              | 異常   |
| 7   | メール 1 文字    | mail = `a`                | "Email format is invalid"        | 異常   |
| 8   | メール 特殊文字  | mail = `a@@invalid!!.com` | "Email format is invalid"        | 異常   |
| 9   | メール `@`+1 字  | mail = `a@b`              | 形式エラー無し + 認証エラー      | 境界値 |

### TC-002: 商品購入ジャーニー（1 本）

`tests/purchase.spec.ts`。ゲストで商品を選び、チェックアウト内でサインインして注文を確定するまで。

| 操作                                       | 期待結果                                         |
| ------------------------------------------ | ------------------------------------------------ |
| ホームで `Thor Hammer` をクリック          | 商品詳細へ遷移する                               |
| "Add to cart"                              | カート件数バッジが `1` になる                    |
| カートアイコン → "Proceed to checkout"     | カート合計が表示される                           |
| 登録済みアカウントでサインイン → 次へ      | "already logged in" が表示される                 |
| 国 `Germany` / 郵便番号 `10115` / 番地 `1` | street / city / state が自動補完される           |
| "Cash on Delivery" → "Confirm" を 2 回     | 1 回目 "Payment was successful"、2 回目 注文確認 |

### Smoke

`tests/smoke.spec.ts`。`/` が HTTP 200 を返し `<title>` が空でないことだけを見る。文言そのものは検証しない。
