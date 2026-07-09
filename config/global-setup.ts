import { execFileSync } from "node:child_process";
import path from "node:path";

// pnpm test はプロジェクトルート実行前提のため、カレントからの相対で解決する
const testTargetDir = path.resolve(process.cwd(), "test-target");

// 購入テストが注文完了のたびに在庫を減らすため、実行前に毎回シードし直して初期在庫に戻す。
// migrate:fresh は何度実行しても同じ結果になるため、CI の既シード状態に対しても害はない
// eslint-disable-next-line functional/no-return-void -- Playwright の globalSetup は void を返す規約
const globalSetup = (): void => {
  execFileSync(
    "docker",
    [
      "compose",
      "exec",
      "-T",
      "laravel-api",
      "php",
      "artisan",
      "migrate:fresh",
      "--seed",
    ],
    { cwd: testTargetDir, stdio: "inherit" },
  );

  // migrate:fresh は商品キャッシュ(TTL 5分)を消さないため、古い商品 ULID が配信され
  // カート追加が 422 で落ちる。seed 後に必ず消す
  execFileSync(
    "docker",
    ["compose", "exec", "-T", "laravel-api", "php", "artisan", "cache:clear"],
    { cwd: testTargetDir, stdio: "inherit" },
  );
};

export default globalSetup;
