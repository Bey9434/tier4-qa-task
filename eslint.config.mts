import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import functional from "eslint-plugin-functional";
import boundaries from "eslint-plugin-boundaries";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      "test-results/",
      "playwright-report/",
      "blob-report/",
      // テスト対象アプリ（submodule）。第三者コードは検査しない
      "test-target/",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommendedTypeChecked,

  // このプロジェクトは Page Object をクラスでなく関数で書く決まり（CLAUDE.md）。
  // 決まりを口約束にせず、クラスや this を書いたら eslint がエラーで止めるようにする
  {
    plugins: { functional },
    rules: {
      "functional/no-classes": "error",
      "functional/no-this-expressions": "error",
      "functional/no-throw-statements": "error",
      "functional/no-return-void": "error",
    },
  },

  // TypeScript 追加ルール
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      // console.log の消し忘れ防止
      "no-console": "error",
    },
  },

  // import の向きを tests → pages の一方向に固定する。pages が tests を import すると
  // テストの都合が Page Object に漏れるため、レビューでなく機械で止める
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["pages/**/*", "tests/**/*"],
      "boundaries/elements": [
        { type: "pages", pattern: "pages" },
        { type: "tests", pattern: "tests" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: { type: "tests" },
              allow: { to: { type: "pages" } },
            },
          ],
        },
      ],
    },
  },

  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.spec.ts", "pages/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // テスト本文はクリック・入力など戻り値のない操作の連続のため、pages 用の
      // 関数型ルールをテストファイルでは解除する
      "functional/no-return-void": "off",
      "functional/no-expression-statements": "off",

      "playwright/consistent-spacing-between-blocks": "error",
      // データ駆動テストは assertOutcome 経由で検証するため、汎用的な名前だと
      // 誤検知/検出漏れが起きる。この用途専用の関数名だけを指定する
      "playwright/expect-expect": [
        "error",
        { assertFunctionNames: ["assertOutcome"] },
      ],
      "playwright/max-nested-describe": "error",
      "playwright/no-conditional-expect": "error",
      "playwright/no-conditional-in-test": "error",
      "playwright/no-element-handle": "error",
      "playwright/no-eval": "error",
      "playwright/no-force-option": "error",
      "playwright/no-nested-step": "error",
      "playwright/no-page-pause": "error",
      "playwright/no-skipped-test": "error",
      "playwright/no-useless-await": "error",
      "playwright/no-useless-not": "error",
      "playwright/no-wait-for-selector": "error",
      "playwright/no-wait-for-timeout": "error",

      "playwright/no-slowed-test": "error",
      "playwright/no-raw-locators": "error",
      "playwright/prefer-native-locators": "error",
      "playwright/prefer-locator": "error",
      "playwright/no-nth-methods": "error",
      "playwright/no-get-by-title": "error",
      "playwright/no-hooks": "error",
      "playwright/prefer-to-be": "error",
      "playwright/prefer-strict-equal": "error",
      "playwright/prefer-to-contain": "error",
      "playwright/prefer-to-have-length": "error",
      "playwright/prefer-to-have-count": "error",
      "playwright/require-to-throw-message": "error",
      "playwright/require-top-level-describe": "error",
      "playwright/prefer-comparison-matcher": "error",
      "playwright/prefer-equality-matcher": "error",
    },
  },

  prettierConfig,
);
