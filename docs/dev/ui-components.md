# UI Components

本ドキュメントでは、Converter WebP/WebM アプリケーションで使用されている UI コンポーネントの詳細を記載します。

## コンポーネント一覧

アプリケーションは以下の 6 つの UI コンポーネントに分割されています：

1. **AppHeader**: アプリケーションヘッダー（タイトルとヘルプボタン）
2. **UploadDropzone**: ドラッグ&ドロップファイルアップロードゾーン
3. **SelectedFiles**: アップロード済みファイルリスト（SortableJS による並べ替え対応）
4. **ProgressPanel**: 変換進捗表示パネル
5. **StickyConvertButton**: 固定位置変換実行ボタン
6. **FloatingUploader**: スクロール時に表示される浮動アップロードボタン

---

## StickyConvertButton

### 概要

画面下部に固定表示される変換実行ボタンコンポーネント。ファイルが選択されている場合にのみ表示され、変換処理を開始するための CTA（Call To Action）として機能します。

### Props

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `hasItems` | `boolean` | ✓ | ファイルが選択されているか（`true` で表示） |
| `isConverting` | `boolean` | ✓ | 変換処理中か（`true` で無効化 + Loading 表示） |
| `outputFormat` | `OutputFormat` | ✓ | 出力フォーマット（`"webp_webm"` または `"jpg_mp4"`） |
| `onConvert` | `() => void` | ✓ | 変換実行時のコールバック関数 |

### 動的ラベル機能（v2.1.0以降）

`outputFormat` プロパティに応じて、ボタンラベルが自動的に変化します：

| `outputFormat` | `isConverting` | 表示ラベル |
|----------------|----------------|------------|
| `"webp_webm"` | `false` | "Convert to WebP / WebM" |
| `"jpg_mp4"` | `false` | "Convert to JPG / MP4" |
| （任意） | `true` | "Converting" |

**実装ロジック:**
```typescript
const formatLabel = outputFormat === "jpg_mp4" ? "JPG / MP4" : "WebP / WebM";
const label = isConverting ? "Converting" : `Convert to ${formatLabel}`;
```

### 使用例

```tsx
import { StickyConvertButton } from "@/components/StickyConvertButton";

<StickyConvertButton
  hasItems={hasItems}
  isConverting={isConverting}
  outputFormat={outputFormat}
  onConvert={() => {
    if (!isConverting && items.length > 0) {
      const form = document.querySelector('form');
      form?.requestSubmit();
    }
  }}
/>
```

### スタイリング

- **位置**: 画面下部中央に固定（`fixed bottom-0`）
- **幅**: 最大 440px、画面幅に応じて調整（`w-[min(440px,calc(100%-32px))]`）
- **影**: ブランドカラーのドロップシャドウ（ダークモード対応）
- **アニメーション**: フェードイン + スライドアップ（`animate-fade-in-up`）
- **ホバー効果**: 変換可能時にホバーで色が濃くなり、影が強調される

### アクセシビリティ

- **aria-live="polite"**: 変換状態の変化をスクリーンリーダーに通知
- **disabled 属性**: 変換中は操作不可に設定
- **aria-hidden="true"**: Loading アイコンは装飾要素として扱う

### 技術的詳細

- **ファイル**: `components/StickyConvertButton.tsx`
- **型定義**: コンポーネント内で `StickyConvertButtonProps` を定義
- **依存**: `clsx` (条件付きクラス名), `lucide-react` (Loader2 アイコン)
- **インポート**: `OutputFormat` 型を `./types` からインポート

---

## その他コンポーネント

### AppHeader

アプリケーション上部のヘッダーセクション。タイトルとヘルプボタンを含みます。

### UploadDropzone

ドラッグ&ドロップ対応のファイルアップロードゾーン。視覚的フィードバック（ホバー時のハイライト）を提供します。

### SelectedFiles

アップロード済みファイルのリスト表示。SortableJS によるドラッグ&ドロップ並べ替え、サムネイル表示、個別ファイル削除機能を提供します。

### ProgressPanel

変換処理中の進捗状況を表示するパネル。ファイル数とパーセンテージを表示します。

### FloatingUploader

スクロール時に表示される浮動アップロードボタン。画面下部にスクロールした際、素早くファイルを追加できるようにします。

---

**最終更新日**: 2025-12-07
