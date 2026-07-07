---
name: e2e-runner
description: Playwright E2E テストの新規作成ワークフローを実行する。「〜のテストを作りたい」「TC-xxx を自動化したい」「spec を追加」などで起動。計画 → DOM 調査 → Page Object → spec → 検証の順で進め、対象サイト固有の落とし穴（再シードで変わる商品 ID・共有アカウントの蓄積データ）を各段階で確認する。
argument-hint: [テスト対象の機能・フロー名]
disable-model-invocation: true
---

# E2E テスト作成ワークフロー

引数: $ARGUMENTS

CLAUDE.md のアーキテクチャ規約・絶対禁止を前提とする（ここでは繰り返さない）。
このスキルは「何を・どの順で・何を確認しながら」進めるかの手順だけを定める。

## 役割分担（サブエージェントへの委譲）

- Phase 1〜2（計画・DOM 調査）と設計判断: メインセッションが行う
- Phase 3〜4（実装）: 設計確定後、`pw-coder` に委譲してよい。
  委譲時は「関数シグネチャ・ロケーター戦略・検証ポイント」を必ずプロンプトに含める
- Phase 5 の後: `pw-reviewer` にレビューを委譲する（実装した本人にレビューさせないため）

## Phase 1: 計画

- 対象フロー・検証ポイント（何をもって成功と定義するか）・リスク分類
  （HIGH: 認証・決済 / MEDIUM: 検索・計算 / LOW: 表示）を提示する
- CLAUDE.md の「絶対禁止」を対象フローに照らして点検し、抵触し得る項目と回避策を明示する
  （リストの本体は CLAUDE.md が単一情報源。ここには再掲しない）
- **ユーザーの承認を得てから実装に進む**

## Phase 2: DOM 調査

- 手段: Playwright 導入後は `pnpm exec playwright codegen <URL>` または使い捨てスクリプトの実行で
  実 DOM を確認する（curl 等の非ブラウザ UA は bot 保護で 403 になるため不可）
- 対象ページの実 DOM を確認し、ロケーター候補を優先順位
  （`getByRole` → `getByLabel` → `getByPlaceholder` → `getByTestId` → `getByText`）で列挙する
- `getByRole` で取れない要素は、その理由（非セマンティック・動的生成など）を記録する
  — Phase 3 の Why コメントの材料になる

## Phase 3: Page Object

- `pages/` に関数を追加する（既存ファイルの規約・命名に合わせる）
- ロケーター選定理由を Why コメントで必ず残す

## Phase 4: spec

- AAA パターン（Arrange-Act-Assert: 準備・実行・検証の 3 段構成）+ `test.step` で
  レポートが読み物になる構成にする
- 各ステップに意味のあるアサーション（Web-First Assertions）を置く。「操作しただけ」のステップを作らない
- テスト名に TC-ID を含める（README のトレーサビリティ表と往復可能にするため）

## Phase 5: 検証

- `pnpm test` を実行し、失敗時は trace で原因を特定する
- フレーク（実行ごとに結果が揺れる状態）の疑いがあれば `--repeat-each=3` で再現性を確認する
- 完了報告には「検証した内容」と「確認していないこと」を分けて明記する
