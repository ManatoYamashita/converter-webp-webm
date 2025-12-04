# Converter WebP/WebM 仕様書

## 1. プロダクト概要
Converter WebP/WebM は Next.js App Router + TypeScript で構築された WebP / WebM 変換ツールです。ユーザーは画像（JPG/JPEG/PNG/AVIF/SVG/HEIC/HEIF/TIFF/BMP/GIF）と動画（MP4/MOV/MKV/AVI/WEBM/M4V）を最大 25 件まとめてアップロードし、ドラッグ&ドロップで順序を調整したうえで WebP（画像）または WebM（動画）へ変換できます。サーバーサイドで `heic-convert` + `sharp`（画像）と `ffmpeg`（動画）を用いた変換を行い、単一ファイルは直接、複数ファイルは ZIP でダウンロードできます。ダークモードを標準搭載し、モダンで洗練されたUIを提供します。

## 2. 提供価値
- **運用効率化**: 大量画像の WebP 化・連番リネーム・一括ダウンロードを 1 画面で完結。
- **品質と安定性**: Node ランタイムで `heic-convert` と `sharp` を利用し、HEIC形式を含む主要な画像フォーマットに対応。アルファチャンネル保持・品質 90 の安定した変換を提供。
- **モダンなUX**: ダークモードを標準搭載し、目に優しく洗練されたインターフェースを実現。

## 3. システム構成
- **フレームワーク**: Next.js 16.0.3 (stable) App Router（`app/` ディレクトリ構成）
- **言語**: TypeScript（strict 設定）
- **UI**: React 19.2.0 (stable) + Tailwind CSS（ダークモード対応）、ドラッグ&ドロップは `sortablejs`、Toast 通知は `sonner`
- **コンポーネント**: 6つの UI コンポーネント（AppHeader, UploadDropzone, SelectedFiles, ProgressPanel, StickyConvertButton, FloatingUploader）に分割済み
- **API**: `app/api/convert/route.ts` に実装した Node Runtime API。Web 標準 `Response` でバイナリを返却
- **バンドラー**: Turbopack（Next.js 16 から組み込み済み）
- **画像/動画変換**:
  - HEIC/HEIF: `heic-convert` で JPEG に変換（品質 1 = 最高品質）後、`sharp` で WebP（品質 90、`rotate()` で EXIF 補正）
  - JPG/JPEG/PNG/AVIF/SVG/TIFF/BMP/GIF: `sharp` で WebP（品質 90、アニメーション対応）
  - 動画: `ffmpeg`（PATH 上の `ffmpeg` または `FFMPEG_PATH` 指定のバイナリ） + `fluent-ffmpeg` で VP9 + Opus の WebM へ変換
- **ZIP 生成**: サーバーサイドで `jszip` を使用して生成
- **ユーティリティ**: `lib/sanitizeFilename.ts` にファイル名サニタイズ・制約定義（MAX_FILES, MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS）
- **型定義**: `types/ffmpeg-installer.d.ts` に `@ffmpeg-installer/ffmpeg` パッケージの型定義

## 4. 機能要件
### 4.1 アップロード & 並べ替え
- 受け付け拡張子（画像）: `jpg`, `jpeg`, `png`, `avif`, `svg`, `heic`, `heif`, `tif`, `tiff`, `bmp`, `gif`
- 受け付け拡張子（動画）: `mp4`, `mov`, `mkv`, `avi`, `webm`, `m4v`
- 最大 25 件まで保持。未対応拡張子はフロントで追加を拒否し、API でも 400 `unsupported_file` を返す
- ファイル追加は入力ボタンまたはドラッグ&ドロップ。`SortableJS` で並べ替え、削除ボタンで個別除外
- **HEIC/HEIF 対応**: Apple デバイスで撮影された HEIC/HEIF も WebP に変換可能
- **動画対応**: 対応拡張子の動画を自動判別し、WebM に変換

### 4.2 ベース名指定
- 初期値は `image`。入力値はクライアント・サーバー双方で `sanitizeFilename` により危険文字排除
- 生成ファイル名は `<base>_<index>.webp`（1 始まり、並び順に依存）

### 4.3 変換処理
- クライアントは全ファイルを1つの `POST /api/convert` リクエストで送信（`base_name`, `image_format`, `image_quality`, `files[]`）。サーバー側で順序を保持したまま変換
- API はバリデーション（拡張子、件数）を行い、以下のフローで変換:
  1. **動画 (`mp4`, `mov`, `mkv`, `avi`, `webm`, `m4v`)**: `ffmpeg` で VP9（libvpx-vp9）+ Opus に再エンコードし WebM を生成（MIME タイプ `video/*` でも動画判定）
  2. **画像 (HEIC/HEIF)**: `heic-convert` で JPEG（品質 1）へ変換 → `sharp` で WebP/JPG（品質 70-100、デフォルト 90、`rotate()` で EXIF 補正）
  3. **画像 (その他)**: `sharp` で WebP/JPG（品質 70-100、デフォルト 90）
  4. **フォーマット選択**: ユーザーが WebP または JPG を選択可能（デフォルト WebP）
  5. **品質調整**: スライダーで 70-100 の範囲で品質を調整可能（デフォルト 90）
- 単一ファイル: WebP/JPG または WebM をバイナリ返却
- 複数ファイル: サーバーでまとめて ZIP 化し、`<base>_converted.zip` として返却（WebP/JPG/WebM 混在可能）
- エラー時は JSON `{ error: "<code>" }` を返し、フロント側でエラーメッセージを表示
- **注意**: WebP のみ animated GIF のアニメーション保持が可能。JPG 変換では最初のフレームのみが保存される

### 4.4 進捗 & メッセージ
- 変換中は進捗バーと `(現在/総数)` を表示し、キャンセルは不可
- **Toast 通知システム**: `sonner` ライブラリを使用し、成功/エラーメッセージを画面右上（top-right）に表示
  - 4秒後に自動消滅（`duration: 4000`）
  - ダークモード対応のカスタムスタイル適用
  - Layout Shift を防止するために固定位置（fixed positioning）を採用
  - 使用例: `toast.success("Conversion completed")`, `toast.error("Error: File too large")`

### 4.5 UI・UX
- **ダークモード**: Tailwind CSS のクラスベースダークモードを標準搭載。`<html class="dark">` により常時ダークテーマを適用
- **カラーパレット**:
  - ブランドカラー: ブルー系（`brand-*`）
  - ダークモード専用: `dark.bg.primary/secondary/tertiary`, `dark.text.primary/secondary/muted`, `dark.border.light/DEFAULT`
- **Toast 通知**: 画面右上に表示され、成功/エラーを視覚的に区別（緑/赤）
- **中央集中型レイアウト**: アップロードエリアを画面中央に大きく配置し、ファーストビューで操作の起点を明確化
- **コンポーネント化**: UI を 6つのコンポーネントに分割し、保守性と再利用性を向上
- **言語**: 英語のみ対応（`lang="en"`）。多言語切り替え機能は非搭載

## 5. 制約・バリデーション
- **`MAX_FILES = 25`**: 超過時は `too_many_files` エラー（Toast 表示）
  - **根拠**: パフォーマンス・サーバーリソース・ユーザビリティのバランスを考慮した上限値
  - **パフォーマンス**: クライアント側では各ファイルの `URL.createObjectURL` によるメモリ消費、サーバー側では `sharp` による変換処理時間が件数に比例して増加。また、各ファイルごとに個別の API リクエストを送信するため、ネットワーク負荷も増大する
  - **サーバーリソース**: Vercel Serverless Functions の `maxDuration = 60` 秒制限を考慮。25件でも1件あたり平均2秒超でタイムアウトのリスクがあるため、上限を設定
  - **ユーザビリティ**: UI 上でサムネイルを表示・操作する際の実用的な上限として設定
- **`MAX_FILE_SIZE_BYTES = 20MB (20 * 1024 * 1024)`**: 個別ファイルサイズ上限。超過時は Toast エラー
  - **根拠**: メモリ制約とタイムアウト防止
  - **メモリ制約**: Vercel Serverless Functions のメモリ制限（1024MB）を考慮。HEIC変換は2段階処理（HEIC→JPEG→WebP）でメモリを多く消費するため、個別ファイルサイズを制限
  - **タイムアウト防止**: 動画変換（ffmpeg）は処理時間が長いため、20MB 上限により 60秒以内の変換を担保
  - **実装**: クライアント側で事前チェック、サーバー側でも検証（二重チェック）
- 危険文字（`<>:"/\|?*` など）はファイル名から除去。空文字は `image`
- 未対応フォーマットは 400 `unsupported_file` を返却（Toast 表示）。特に PDF/EPS、RAW 系（DNG/CR2/NEF/ARW など）、JP2/JXR/JXL、EXR/HDR は非対応
- Vercel Serverless の `maxDuration = 60` 秒を考慮。長尺・高解像度動画の WebM 変換ではタイムアウトの可能性があるため、20MB 上限を設けている

## 6. 非機能要件
- **パフォーマンス**: 変換は同期処理。大量アクセス時は Vercel の Serverless Functions（Node runtime）を水平スケールで処理
- **セキュリティ**: 拡張子チェック・サニタイズ済みファイル名でディレクトリトラバーサルを抑止。アップロードファイルはメモリ上で扱い、永続保存しない
- **安定運用**: エラー発生時もステータスコード 400/500 を返却し、クライアント通知
- **アクセシビリティ**: 主要ボタンはキーボード操作対応。進捗文言はスクリーンリーダーで読めるようテキスト表示

## 7. 運用・デプロイ
- ローカル開発は `npm run dev` で `http://localhost:3000` を起動（Turbopack は Next.js 16 から組み込み済み）
- ビルド/デプロイは `npm run build` → `npm run start`。Vercel では `npm run build` が自動実行され、Node ランタイムで API が動作
- Next.js 16.0.3 (stable) と React 19.2.0 (stable) を使用。Node.js 20.9.0以上が必須
- 依存アップデート時は CI で `npm install` → `npm run lint` (eslint .) → `npm run build` を必ず回す

## 8. 今後の拡張案
- 画像品質・画質調整スライダーの追加（`sharp` オプション expose）
- フロント側でのバリデーション強化（ファイルサイズ合計、同名ファイルへの警告）
- Next.js Server Actions による一括アップロード → サーバー ZIP 生成フローへの移行
- ライト/ダークモード切り替え機能の追加（現在は常時ダークモード）
- 他の画像フォーマットへの対応（AVIF、GIF、TIFF など）
- HEIC 変換のパフォーマンス最適化（並列処理、キャッシュ戦略）
