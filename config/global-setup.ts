import { execFileSync } from "node:child_process";
import path from "node:path";

// pnpm test はプロジェクトルート実行前提のため、カレントからの相対で解決する
const testTargetDir = path.resolve(process.cwd(), "test-target");

// 購入テストは注文のたびに在庫を減らす。実行前にシードし直して初期在庫に戻す
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

  // migrate:fresh は商品キャッシュ(TTL 5分)を消さない。
  // 残すと古い商品 ULID が配信され、カート追加が 422 で落ちる
  execFileSync(
    "docker",
    ["compose", "exec", "-T", "laravel-api", "php", "artisan", "cache:clear"],
    { cwd: testTargetDir, stdio: "inherit" },
  );
};

export default globalSetup;
