# Repository Guidelines

## Project Structure & Module Organization
- `app/` は Next.js 15 App Router のエントリポイント。`page.tsx` にメイン UI（ダークモード対応）、`api/convert/route.ts` に WebP 変換 API（HEIC対応）を配置しています。
- `lib/` には `sanitizeFilename.ts` などの共有ユーティリティを集約します。ブラウザ・サーバー双方で実行される可能性があるため副作用のない実装を徹底してください。
- `components/` は再利用可能な UI 部品用。規模拡大時に `app/page.tsx` から抽出し、`/components` へ移します。
- Tailwind グローバルスタイルは `app/globals.css` にあり、ダークモード用カラーパレット、テーマカラー、スクロールバーのスタイルを定義済みです。
- `heic-convert.d.ts` に `heic-convert` パッケージの型定義を配置（公式型定義が存在しないため手動作成）。
- ドキュメントの SoT は `docs/`。更新や追記時は `docs/index.md` のインデックスも必ずメンテナンスします。

## Build, Test, and Development Commands
- 依存解決と開発サーバー起動（Turbopack 使用）:
```bash
npm install
npm run dev   # next dev --turbo
```
- 本番ビルド/起動: `npm run build && npm run start`（ビルドは Next.js 標準パイプライン）
- Lint チェック: `npm run lint`
- Next.js 15 は canary を使用しています。Node.js 18.18+ での動作確認を推奨します。

## Coding Style & Naming Conventions
- TypeScript は strict モード。エイリアス `@/*` を通じてルート相対 import を利用してください。
- React コンポーネントは関数コンポーネント・hooks ベース。副作用には `useEffect`、非同期処理には `async/await` を用います。
- Tailwind クラスはロジックと分離し、複雑な組み合わせは `clsx` で整理します。トークンは `tailwind.config.ts` の `brand` および `dark` カラーを再利用。
- API ルートは Node runtime (`export const runtime = "nodejs"`) を明示し、バイナリレスポンスには Web 標準 `Response` を使用します。
- HEIC/HEIF 変換は `heic-convert` で JPEG に変換後、`sharp` で WebP に変換する2段階処理を実装します（`sharp` は HEIC をネイティブサポートしないため）。

## Testing Guidelines
- 現状は手動テストを必須とします。最低限以下を確認してください:
  - 単一ファイル変換 → `.webp` がダウンロードされるか
  - 複数ファイル + 並べ替え → ZIP の順序が UI と一致するか
  - HEIC/HEIF ファイル変換 → WebP に正常に変換されるか
  - 拡張子バリデーション → 非対応形式でエラーメッセージが表示されるか
  - ダークモード → すべての UI 要素が正しく表示されるか
- 自動テスト導入時は Playwright でエンドツーエンドを、Jest + React Testing Library で UI ロジックをカバーする方針です。

## Commit & Pull Request Guidelines
- コミットメッセージは `<type>: <summary>`（例: `feat: add quality selector`）。`type` は `feat`/`fix`/`refactor`/`docs`/`chore`/`test`。
- PR 説明には以下を推奨:
  - 変更概要（箇条書き）
  - 手動テスト結果チェックリスト（上記最低限テストを引用）
  - UI 変更時はスクリーンショットまたは GIF を添付

## Deployment Notes
- Vercel でのデプロイを想定。`package.json` の `build`/`start` スクリプトを利用し、Next.js 標準ビルドアーティファクトを Node runtime で提供します。
- `sharp` と `heic-convert` はネイティブバイナリを含むため、Vercel のビルドステップで自動的にインストールされます。ローカル CI では `npm ci` と `npm run build` の組み合わせで検証してください。
- Edge Runtime では `sharp` および `heic-convert` が動作しないため、API ルートに `export const runtime = "nodejs"` を必ず付与します。
- `heic-convert` のビルド時に警告（`Critical dependency: require function is used in a way...`）が表示されますが、これは `libheif-js` の WASM バンドル読み込みに関するもので、実行には影響しません。

## Documentation & Knowledge Base
- ルールや知見は `docs/` に集約し、更新時は `docs/index.md` に反映する。
- ブランチ運用・レビュー手順は `docs/dev/branch.md`、要件定義は `docs/specs/spec.md` を参照。
- ドキュメント追加時のコミットは `doc:` プレフィックスを推奨。
