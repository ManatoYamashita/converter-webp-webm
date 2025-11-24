# CLAUDE.md（docs 連携・運用ルール）

本プロジェクトにおける知見・ルールは `docs/` を唯一のソース・オブ・トゥルース（SoT）とします。エージェントや開発者が得た知見は、適切な `docs/` 配下の Markdown に追記、または新規作成し、索引である `docs/index.md` を必ず更新します。

## 基本方針
- ルール/知見は `docs/` に集約。
- 変更時は `docs/index.md`（索引・運用ルール）を更新。
- ドキュメントコミットは `DOC:` プレフィックス。
- 機密情報（PII等）は `docs/` に保存しない。

## Git リモート設定

このプロジェクトには複数のリモートが設定されています：

- **`origin`**: `https://github.com/ManatoYamashita/converter-webp-webm.git` （メインリポジトリ、デフォルト）
- **`legacy`**: `https://github.com/safe1124/webplyzer.git` （旧リポジトリ、参照用）

### Push 方法

`origin` がデフォルトリモートとして設定されているため、通常の `git push` で自動的に `origin` にプッシュされます：

```bash
# 通常の push（origin に自動的にプッシュされる）
git push

# または明示的に指定
git push origin prod
```

### tracking ブランチの確認

`prod` ブランチは `origin/prod` を追跡するように設定されています：

```bash
# 現在のブランチの追跡状態を確認
git branch -vv

# 出力例：
# * prod  cfd3b70 [origin/prod] DOC: 本番URL更新
```

### リモート確認方法

```bash
# 設定されているリモートを確認
git remote -v

# 出力例：
# legacy  https://github.com/safe1124/webplyzer.git (fetch)
# legacy  https://github.com/safe1124/webplyzer.git (push)
# origin  https://github.com/ManatoYamashita/converter-webp-webm.git (fetch)
# origin  https://github.com/ManatoYamashita/converter-webp-webm.git (push)
```

詳細は `docs/dev/branch.md` を参照してください。

## 運用フロー（PDCA）
1. PLAN: `docs/index.md` で既存配置と命名を確認。
2. DO: 該当 `docs/` ファイルを更新 or 新規作成。必要に応じてカテゴリディレクトリ追加。
3. CHECK: リンク切れ/重複/命名不整合が無いか確認。
4. ACTION: 運用改善点や不足ルールをドキュメント化。

## 命名・配置ガイド
- ファイル名は `kebab-case.md`、目的が明確な名前。
- 1ファイルが 300 行超 or 技術領域が分岐 → 分割/ディレクトリ化。
- 代表例：
  - `docs/coding-standards.md`（規約）
  - `docs/import-path-migration.md`（移行ガイド）
  - `docs/dev/branch.md`（ブランチ/CI）
  - `docs/FRONTEND_IMPROVEMENTS.md`（改善メモ）

## 索引（参照）
- ドキュメントのエンドポイント: `docs/index.md`
- ブランチ戦略: `docs/dev/branch.md`

最終更新日: 2025-01-24