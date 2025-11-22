# Webplyzer 仕様書

## 1. プロダクト概要
Webplyzer は Next.js 15（App Router + TypeScript）で構築された WebP 変換ツールです。ユーザーは JPG/JPEG/PNG/HEIC ファイルを最大 25 件まとめてアップロードし、ドラッグ&ドロップで順序を調整したうえで WebP 形式へ変換できます。サーバーサイドで `heic-convert` と `sharp` を用いた高速変換を行い、単一ファイルは直接、複数ファイルは ZIP でダウンロードできます。ダークモードを標準搭載し、モダンで洗練されたUIを提供します。

## 2. 提供価値
- **運用効率化**: 大量画像の WebP 化・連番リネーム・一括ダウンロードを 1 画面で完結。
- **品質と安定性**: Node ランタイムで `heic-convert` と `sharp` を利用し、HEIC形式を含む主要な画像フォーマットに対応。アルファチャンネル保持・品質 90 の安定した変換を提供。
- **モダンなUX**: ダークモードを標準搭載し、目に優しく洗練されたインターフェースを実現。

## 3. システム構成
- **フレームワーク**: Next.js 15 App Router（`app/` ディレクトリ構成）
- **言語**: TypeScript（strict 設定）
- **UI**: React 19 RC + Tailwind CSS（ダークモード対応）、ドラッグ&ドロップは `sortablejs`
- **API**: `app/api/convert/route.ts` に実装した Node Runtime API。Web 標準 `Response` でバイナリを返却
- **バンドラー**: Turbopack（開発時 `next dev --turbo`）/ Next.js 標準ビルド（本番 `next build`）
- **画像変換**:
  - HEIC/HEIF: `heic-convert` で JPEG に変換（品質 1 = 最高品質）
  - その後 `sharp` で WebP に変換（品質 90、`rotate()` で EXIF 補正）
  - JPG/JPEG/PNG: 直接 `sharp` で WebP に変換
- **ZIP 生成**: クライアント側で `jszip` を動的インポートして生成
- **ユーティリティ**: `lib/sanitizeFilename.ts` にファイル名サニタイズ・制約定義
- **型定義**: `heic-convert.d.ts` に `heic-convert` パッケージの型定義（公式型定義が存在しないため手動作成）

## 4. 機能要件
### 4.1 アップロード & 並べ替え
- `.jpg`, `.jpeg`, `.png`, `.heic`, `.heif` のみ受け付け、最大 25 件まで保持
- ファイル追加は入力ボタンまたはドラッグ&ドロップで行い、未対応拡張子は即時警告
- `SortableJS` を用いたドラッグ操作でサムネイルカードを並べ替え。削除ボタンで個別除外
- **HEIC/HEIF 対応**: Apple デバイスで撮影された HEIC/HEIF 形式の画像も WebP に変換可能

### 4.2 ベース名指定
- 初期値は `image`。入力値はクライアント・サーバー双方で `sanitizeFilename` により危険文字排除
- 生成ファイル名は `<base>_<index>.webp`（1 始まり、並び順に依存）

### 4.3 変換処理
- クライアントは各ファイルごとに `POST /api/convert` へ `FormData` を送信（`base_name`, `file_index`, `files`）
- API はバリデーション（拡張子、件数）を行い、以下の2段階で WebP 変換を実行：
  1. **HEIC/HEIF の場合**: `heic-convert` で JPEG に変換（品質 1 = 最高品質）
     - **技術的背景**: `sharp` は HEIC 形式をネイティブサポートしていない（H.265/HEVC コーデックの特許ライセンス問題のため）
     - **変換フロー**: HEIC バイナリ → `heic-convert` → JPEG バイナリ → `sharp` → WebP バイナリ
  2. **共通処理**: `sharp` で WebP 変換（品質 90、`rotate()` で EXIF 補正）→バッファをレスポンス
- 単一ファイル: `Content-Type: image/webp` でバイナリ返却
- 複数ファイル: クライアント側で `jszip` により ZIP 化し、`<base>_webp.zip` としてダウンロード
- エラー時は JSON `{ error: "<code>" }` を返し、フロント側で英語エラーメッセージを表示

### 4.4 進捗 & メッセージ
- 変換中は進捗バーと `(現在/総数)` を表示し、キャンセルは不可
- 成功時・失敗時のフィードバックをカード下部に表示。すべて英語で統一

### 4.5 UI・UX
- **ダークモード**: Tailwind CSS のクラスベースダークモードを標準搭載。`<html class="dark">` により常時ダークテーマを適用
- **カラーパレット**:
  - ブランドカラー: ブルー系（`brand-*`）
  - ダークモード専用: `dark.bg.primary/secondary/tertiary`, `dark.text.primary/secondary/muted`, `dark.border.light/DEFAULT`
- **中央集中型レイアウト**: アップロードエリアを画面中央に大きく配置し、ファーストビューで操作の起点を明確化
- **言語**: 英語のみ対応（`lang="en"`）。多言語切り替え機能は非搭載

## 5. 制約・バリデーション
- `MAX_FILES = 25`。超過時は `too_many_files` エラー
  - **根拠**: パフォーマンス・サーバーリソース・ユーザビリティのバランスを考慮した上限値
  - **パフォーマンス**: クライアント側では各ファイルの `URL.createObjectURL` によるメモリ消費、サーバー側では `sharp` による変換処理時間が件数に比例して増加。また、各ファイルごとに個別の API リクエストを送信するため、ネットワーク負荷も増大する
  - **サーバーリソース**: Vercel Serverless Functions の `maxDuration = 60` 秒制限を考慮。25件でも1件あたり平均2秒超でタイムアウトのリスクがあるため、上限を設定
  - **ユーザビリティ**: UI 上でサムネイルを表示・操作する際の実用的な上限として設定
- 危険文字（`<>:"/\|?*` など）はファイル名から除去。空文字は `image`
- フロントでは未対応拡張子を追加しない。サーバーでも拡張子を最終チェックし、全件不適合なら `no_valid_files`
- 想定最大リクエストサイズは 100MB（各環境でリバースプロキシ等の制限に留意）

## 6. 非機能要件
- **パフォーマンス**: 変換は同期処理。大量アクセス時は Vercel の Serverless Functions（Node runtime）を水平スケールで処理
- **セキュリティ**: 拡張子チェック・サニタイズ済みファイル名でディレクトリトラバーサルを抑止。アップロードファイルはメモリ上で扱い、永続保存しない
- **安定運用**: エラー発生時もステータスコード 400/500 を返却し、クライアント通知
- **アクセシビリティ**: 主要ボタンはキーボード操作対応。進捗文言はスクリーンリーダーで読めるようテキスト表示

## 7. 運用・デプロイ
- ローカル開発は `npm run dev` で `http://localhost:3000` を起動
- ビルド/デプロイは `npm run build` → `npm run start`。Vercel では `npm run build` が自動実行され、Node ランタイムで API が動作
- canary リリースを利用しているため、依存アップデート時は CI で `npm install` → `npm run lint` → `npm run build` を必ず回す
- Next.js 15 canary は Node.js 18.18 以上が必須。`.nvmrc` を利用しローカル環境のバージョン差異を防ぐ。

## 8. 今後の拡張案
- 画像品質・画質調整スライダーの追加（`sharp` オプション expose）
- フロント側でのバリデーション強化（ファイルサイズ合計、同名ファイルへの警告）
- Next.js Server Actions による一括アップロード → サーバー ZIP 生成フローへの移行
- ライト/ダークモード切り替え機能の追加（現在は常時ダークモード）
- 他の画像フォーマットへの対応（AVIF、GIF、TIFF など）
- HEIC 変換のパフォーマンス最適化（並列処理、キャッシュ戦略）
