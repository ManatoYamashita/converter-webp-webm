# Converter WebP/WebM ブランチ運用ガイド

## 基本ブランチ
- `prod`: 本番相当の安定ブランチ。保護設定により PR 経由のマージのみ許可。
- `main`: 前バージョンの保存用ブランチ。基本的に使用しない。
- リリース専用ブランチは未運用。必要時に本ファイルへ追記する。

## 重要な禁止事項
- **`main` および `prod` への直接pushは厳禁**。保護設定により物理的にブロックされる。
- すべての変更は作業ブランチを作成し、CI/CD を通じて PR を経由して `prod` にマージする。
- 作業ブランチから `main` や `prod` への直接マージも禁止。必ず PR を作成すること。

## 作業ブランチ命名規則
```
<type>/<short-description>
```
- 使用タイプ: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- 例: `feat/language-picker`, `fix/zip-order`, `refactor/upload-flow`

## 標準フロー
**原則**: すべての変更は作業ブランチを作成し、CI/CD を通じて PR を経由して `prod` を更新する。

1. 最新化: `git checkout prod && git pull --ff-only origin prod`
2. ブランチ作成: `git checkout -b <type>/<topic>`（作業のたびに必ず新しいブランチを作成）
3. 開発: `npm install`（初回のみ）→ `npm run dev`（Turbopack）で Next.js を起動しつつ実装
4. 手動テスト（最低限）
   - 単一画像の WebP 変換が成功し、ダウンロードできる
   - 複数画像をドラッグで並べ替えてから変換し、ZIP 内の順序が UI と一致する
   - 変換後のファイル名が一貫性を持った連番になる
5. 差分を `git add` → コミット → `git push`。作業ブランチ（`feature/**`, `fix/**`, `chore/**` など）に push すると CI/CD が自動実行され、チェックとPR が作成される。PR 作成時はチェックリストを記載
6. PR レビュー → 承認 → `prod` へマージ（CI/CD を通じて自動化）

## CI/CD と GitHub Actions
- ランナー環境: `ubuntu-latest` / Node.js 20 / `npm ci` を使用。
- `prod`/`main` を除く開発ブランチへの push で実行（例: `feature/**`, `fix/**`, `chore/**` など）: Lint (`npm run lint`) → 型チェック（`npx tsc --noEmit`）→ Build（`npm run build`）。すべて成功すると `origin/prod` との差分サマリーとチェック結果を本文に含む `prod` 向けPRを自動生成または更新する。
- 自動PR作成はリポジトリで「Actions による PR 作成を許可」もしくは `PR_CREATION_TOKEN`（`pull_request` 作成権限を持つ PAT）を `secrets` に設定している場合のみ動作する。許可されていない場合は lint/typecheck/build のみ実行され、PRは作成されない。
- 自動生成PRタイトル: `chore: sync <branch> to prod`。本文にソース/ベースブランチ、先行コミット数、Lint/Typecheck/Build結果、`git diff --stat origin/prod...HEAD` の概要を記載。
- `prod` 更新時に実行: 本番ビルド（`npm run build`）→ サーバー起動（`next start --hostname 0.0.0.0 --port 3000`）→ `wait-on` で待機 → `@lhci/cli` で Lighthouse 推奨プリセットを1回実行し、`.lighthouseci` をアーティファクトとして保存。
- PRマージ前にCI結果と自動PRのサマリーを必ず確認し、Lighthouseレポートも合わせてレビューすること。

## コミットメッセージ規約
- フォーマット: `<PREFIX>: <summary>`（例: `FEATURE: add drag handle animations`）
- 本文が必要な場合は背景・実装・変更点・テスト結果などを箇条書きで追記
- 一貫性確保のため、複数コミットが必要な大規模変更でも PREFIX を揃える

## 運用メモ
- `sharp` 利用のため API ルートは Node runtime に固定。エッジ化の提案が出た場合は技術検証が必要。
- 依存追加後は `npm run lint` と `npm run build` をローカルで実行し、CI と同条件で確認。
- canary 依存の更新は Breaking 変更が混在する可能性があるため、`pnpm patch` 等でバージョンを固定し、`docs/specs/spec.md` に影響を記録する。
- Next.js 15 は Node.js 18.18 以上が必須。ローカルで lint/build を実行する前に `nvm use` などでバージョンを揃える。
- Turbopack の挙動差異が発生した場合は `next dev` の `--no-turbo` で切り替え検証し、結果をドキュメント化する。
