import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import functional from "eslint-plugin-functional";
import boundaries from "eslint-plugin-boundaries";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // lint対象外
  {
    ignores: [
      "node_modules/",
      "test-results/",
      "playwright-report/",
      "blob-report/",
    ],
  },
  // JS/TS ファイルに推奨ルールを適用
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.browser },
  },
  // TypeScript 型チェック付き推奨ルール
  ...tseslint.configs.recommendedTypeChecked,

  // 関数型プログラミング推奨ルール (eslint-plugin-functional)
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
      // import type の使い方を統一（型は import type で明示）
      "@typescript-eslint/consistent-type-imports": "error",
      // console.log の消し忘れ防止
      "no-console": "error",
    },
  },

  // アーキテクチャルール (eslint-plugin-boundaries)
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
          default: "disallow", // 原則禁止
          rules: [
            // tests から pages への import のみ
            {
              from: { type: "tests" },
              allow: { to: { type: "pages" } },
            },
          ],
        },
      ],
    },
  },

  // 型情報の設定（tsconfig.json を使用）
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Playwright 推奨ルール（テストファイルのみに適用）
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.spec.ts", "pages/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "functional/no-return-void": "off", // テストは副作用必須
      "functional/no-expression-statements": "off", // expect(...) は式

      // recommendedのwarnをerrorにする。
      "playwright/consistent-spacing-between-blocks": "error",
      "playwright/expect-expect": "error",
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

      // recommended に含まれない追加ルール
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

  // Prettier と競合するルールを無効化
  prettierConfig,
);
