# tier4-qa-task

[practice-software-testing](https://github.com/testsmith-io/practice-software-testing)（Toolshop）を対象とした E2E テスト自動化。手動テストケースの設計と、Playwright + TypeScript による自動化を含む。

テスト対象は公開デモサイトではなく、`test-target` サブモジュールをローカル Docker で起動したもの。公開デモは全利用者がアカウントを共有しており、他人のログイン失敗でロックされるとこちらのテストも落ちるため。

## セットアップと実行

前提: Node 24、pnpm 10.28.2、Docker。

`.env` は暗号化された状態でコミットされている。復号鍵 `.env.keys` はコミットされないので、別途受け取ってリポジトリ直下に置く。

```bash
pnpm install

# テスト対象アプリを起動（初回はビルドで数分かかる）
cd test-target && docker compose up -d && cd ..

pnpm test
```

`pnpm test` は `dotenvx run -- playwright test` を実行する。dotenvx が `.env` を復号し、`globalSetup`（`config/global-setup.ts`）が DB を初期シード状態に戻してからテストが始まる。

`.env` の変数（一覧は `.env.example` を参照）:

| 変数       | 既定値                  | 用途                                      |
| ---------- | ----------------------- | ----------------------------------------- |
| `BASE_URL` | `http://localhost:4200` | ブラウザが開く UI のアドレス              |
| `API_URL`  | `http://localhost:8091` | テストがアカウント登録に直接叩く REST API |

## 手動テストケース設計

### TC-001: ログイン（9 シナリオ）

対象: `tests/login.spec.ts`。各シナリオは専用に API 登録したアカウント（`config/account.ts`）の認証情報を土台に、入力値だけを変える。

| #   | シナリオ                 | メール             | パスワード       | 期待結果                                      | 種別   |
| --- | ------------------------ | ------------------ | ---------------- | --------------------------------------------- | ------ |
| 1   | 正しい認証情報           | 登録済み           | 登録済み         | `/account` へ遷移し "My account" が表示される | 正常   |
| 2   | 誤ったパスワード         | 登録済み           | `wrong-password` | "Invalid email or password"                   | 異常   |
| 3   | パスワード空欄           | 登録済み           | （空）           | "Password is required"                        | 異常   |
| 4   | パスワード 2 文字        | 登録済み           | `ab`             | "Password length is invalid"                  | 境界値 |
| 5   | パスワード 3 文字        | 登録済み           | `abc`            | 長さエラーは出ず、"Invalid email or password" | 境界値 |
| 6   | メール空欄               | （空）             | 登録済み         | "Email is required"                           | 異常   |
| 7   | メール形式不正: 1 文字   | `a`                | 登録済み         | "Email format is invalid"                     | 異常   |
| 8   | メール形式不正: 特殊文字 | `a@@invalid!!.com` | 登録済み         | "Email format is invalid"                     | 異常   |
| 9   | メール `@`+1 文字        | `a@b`              | 登録済み         | 形式エラーは出ず、"Invalid email or password" | 境界値 |

**境界値の根拠**: パスワードは 2 文字で無効、3 文字で通過する。メールは `a@b` で通過する。いずれも仕様書ではなく、ローカルの `test-target` に入力して観測した実測値。アプリの検証ルールが変われば境界も変わる。

**#5・#9 が認証エラーまで確認する理由**: エラーが出ないことだけを見ると、検証を通過した場合と、ボタンが反応せず何も送信されていない場合を区別できない。後者でもテストは通ってしまう。認証エラーが出ることは、サーバが入力を受理して照合まで進んだ証拠になる。

### TC-002: 商品購入ジャーニー（1 本）

対象: `tests/purchase.spec.ts`。ゲストで商品を選び、チェックアウト内でサインインして注文を確定するまでを 1 本で検証する。

| ステップ                    | 手順                                                 | 期待結果                                                      |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| 商品詳細へ遷移              | ホームで商品名 `Thor Hammer` のリンクをクリック      | 商品詳細ページへ遷移する                                      |
| カートに追加                | "Add to cart" をクリック                             | ヘッダーのカート件数バッジが `1` になる                       |
| カート確認 → チェックアウト | カートアイコン → "Proceed to checkout"               | カート合計が表示される                                        |
| チェックアウト内サインイン  | 登録済みアカウントでログイン → "Proceed to checkout" | "already logged in" が表示される                              |
| 住所を入力                  | 国 `Germany` / 郵便番号 `10115` / 番地 `1`           | street / city / state は入力しない                            |
| 自動補完を検証              | 補完の完了を待って "Proceed to checkout"             | `Eckertplatz` / `Heidenheim an der Brenz` / `Rheinland-Pfalz` |
| 支払い → 注文確定           | "Cash on Delivery" を選び "Confirm" を 2 回クリック  | 1 回目に "Payment was successful"、2 回目に注文確認メッセージ |

補足:

- 商品は ID ではなく名前で辿る。ID は再シードのたびに変わる ULID のため。
- street / city / state は手入力しない。アプリが郵便番号から自動補完する。補完値はアプリの `FakerPostcodeDriver` が郵便番号を種に生成する架空の住所で、実在の地理とは無関係。
- "Confirm" は 1 つのボタンで、1 回目に支払い検証、2 回目に注文作成を行う。注文作成は非冪等なのでクリックはリトライしない。完了待ちは Web-First Assertions（条件を満たすまで自動でリトライする検証）に任せる。

### Smoke: トップページ到達性

対象: `tests/smoke.spec.ts`。`/` が HTTP 200 を返し、`<title>` が空でないことだけを確認する。タイトルの文言そのものは検証しない。サイト側の文言変更で落ちるのを避けるため。
