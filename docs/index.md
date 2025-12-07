# Converter WebP/WebM ドキュメントインデックス

## このドキュメントについて
- `docs/` ディレクトリの構成と運用ルールを集約したハブです。
- 新たな仕様やナレッジを追加する際は本ファイルを必ず参照し、作業完了時に最新の情報へ更新してください。

## ディレクトリ構成
```text
docs/
├─ index.md                       ... 本ファイル。インデックスと運用ルール
├─ specs/
│  └─ spec.md                     ... プロダクト要件・システム仕様
├─ design/
│  └─ design-system.md            ... デザインシステム包括ガイド
└─ dev/
   ├─ branch.md                   ... ブランチ戦略・レビュー手順
   ├─ ci-lighthouse.md            ... Lighthouse CI 設定と NO_FCP エラー対策
   ├─ turbopack-support.md        ... Turbopack サポート状況と移行ガイド
   ├─ next16-upgrade.md           ... Next.js 16 アップグレードサマリー
   ├─ cve-2025-55182-security-patch.md ... CVE-2025-55182 セキュリティパッチ対応記録
   └─ vercel-sharp-deployment.md  ... Vercel sharp デプロイエラー解決ガイド
```

## 各ドキュメントの概要
- `docs/specs/spec.md`: Next.js 16 + Node Runtime 構成、画像 WebP/JPG + 動画 WebM/MP4 変換（Sharp + heic-convert + ffmpeg）、対応フォーマットと制約値を記載。
- `docs/design/design-system.md`: カラーパレット、タイポグラフィ、UIコンポーネントパターン、ダークモード実装などデザインシステム全体を網羅。
- `docs/dev/branch.md`: `main` ブランチ保護方針、ブランチ命名、コミット/PR テンプレートを定義。Git リモート設定（origin vs personal）、push 先の指定方法、デフォルトの追跡ブランチ設定を記載（2025-01-24更新）。
- `docs/dev/ci-lighthouse.md`: GitHub Actions の Lighthouse CI 設定と NO_FCP（First Contentful Paint）エラーのトラブルシューティング。wait-on 設定強化、Next.js hydration 待機、Chrome flags、パフォーマンス閾値を記載（2025-01-24追加）。
- `docs/dev/turbopack-support.md`: Turbopack のサポート状況と本番ビルドへの移行ガイド。
- `docs/dev/next16-upgrade.md`: Next.js 16 および React 19 へのアップグレード詳細記録（2025-11-22実施）。
- `docs/dev/cve-2025-55182-security-patch.md`: CVE-2025-55182（React Server Components RCE脆弱性）のセキュリティパッチ対応記録。React 19.2.1、Next.js 16.0.7 へのアップグレード、追加の glob 脆弱性修正を含む（2025-12-07実施）。
- `docs/dev/vercel-sharp-deployment.md`: Vercel デプロイ時の sharp モジュールエラー解決プロセス。serverExternalPackages 設定、postinstall スクリプト、クロスプラットフォーム依存関係の問題と解決方法を詳述（2025-11-24解決）。
- `../README.md`: セットアップ手順とユーザー向け機能概要。
- `../AGENTS.md`: コントリビュータ向けガイドライン（プロジェクト構造、開発コマンド、レビュー要件）。
- `../CLAUDE.md`: Claude Code 向け技術ガイド（アーキテクチャ、開発コマンド、AIエージェント向けヒント）。

## 更新ルール
1. ドキュメントを追加・修正したら、概要と関連リンクをこのインデックスにも反映する。
2. ツリー表示や概要文が実態と異なる場合は同一コミット内で修正する。
3. コミットメッセージは `doc: <summary>` 形式を推奨。仕様変更を伴う場合は `feat:` 等、他ドキュメントと整合させる。
4. PR では変更ファイルと検証内容（例: 主要ユースケースの手動確認）を明示し、レビュアが差分を追いやすい状態にする。

## 運用メモ
- 変換ロジックや API の仕様変更時は `docs/specs/spec.md` を起点に更新し、`README.md` や `CLAUDE.md` との整合も確認する。
- ブランチ/コミット運用に改定が入った際は `docs/dev/branch.md` を更新し、このファイルの概要も合わせて書き換える。
- HEIC/HEIF 対応など新しい画像フォーマットを追加した際は、`docs/specs/spec.md` の変換処理セクションに技術的背景と実装詳細を記録する。

---

**最終更新日**: 2025-12-07
**更新内容**:
- **セキュリティ対応**: CVE-2025-55182（React Server Components RCE脆弱性）のパッチ適用。React 19.2.0 → 19.2.1、Next.js 16.0.3 → 16.0.7 にアップグレード。追加で glob パッケージの脆弱性も修正（`npm audit` 結果: 0 vulnerabilities）。
- `docs/dev/cve-2025-55182-security-patch.md` を新規作成（脆弱性詳細、アップグレード手順、検証結果、知見を記録）。
- `docs/index.md` を更新（新規ドキュメントへのリンク追加、最終更新日更新）。
