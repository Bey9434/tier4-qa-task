#!/usr/bin/env bash
# PostToolUse (Edit|Write) フック: 編集されたファイルに prettier / eslint --fix を自動適用する。
# stdin に {"tool_input":{"file_path":"..."}} 形式の JSON が渡される。

set -u

f=$(node -e 'const s=require("fs").readFileSync(0,"utf8");try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}')
[ -n "$f" ] || exit 0

# prettier: 整形は黙って適用する（成功しても返すべき情報がない。未導入の間は無害にスキップ）
case "$f" in
  *.ts|*.mts|*.cts|*.js|*.json) pnpm exec prettier --write "$f" >/dev/null 2>&1 || true ;;
esac

# eslint: --fix を試み、自動修正できず残った違反だけを Claude に返す。
# exit 2 + stderr は PostToolUse フックの公式フィードバック機構で、モデルに届いて修正を促す。
# eslint --version の存在チェックで未導入の間（Phase 1 以前）は無害にスキップする。
case "$f" in
  *.ts|*.mts|*.cts|*.js)
    if pnpm exec eslint --version >/dev/null 2>&1; then
      if ! out=$(pnpm exec eslint "$f" --fix 2>&1); then
        echo "eslint: 自動修正できない違反が残っています。修正してください:" >&2
        echo "$out" >&2
        exit 2
      fi
    fi
    ;;
esac
exit 0
