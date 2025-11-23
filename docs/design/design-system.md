# Webplyzer Design System

**Version:** 2.0.0
**Last Updated:** 2025-11-23
**Status:** Active

---

## Overview

Webplyzerのデザインシステムは、**シンプル性**、**モダン性**、**ダークモード対応**を柱とした、一貫性のあるユーザー体験を提供するための設計指針です。

### Design Philosophy

- **Simplicity First**: 必要最小限の要素で最大の価値を提供
- **Dark Mode Native**: ダークモードをデフォルトとし、目に優しいUI
- **Material Design Blue**: ブランドカラーとしてMaterial Design Blueを採用
- **Accessibility**: WCAG AA/AAA準拠の高コントラスト設計

### Tech Stack

- **Framework**: Next.js 16.0.3 (stable) + Tailwind CSS
- **Color System**: Material Design Blue (50-900) + Custom Dark Palette
- **Typography**: System Font Stack (OS最適化)
- **Dark Mode**: Class-based (`darkMode: 'class'`)

---

## Color System

### Brand Color Palette

Webplyzerは**Material Design Blue**をブランドカラーとして採用しています。50から900までの10段階のパレットを定義し、ライトモード・ダークモード両対応を実現しています。

| Shade | HEX | RGB | Usage |
|-------|-----|-----|-------|
| **50** | `#E3F2FD` | `227, 242, 253` | ホバー背景、スクロールバートラック |
| **100** | `#BBDEFB` | `187, 222, 251` | 補助的な背景色 |
| **200** | `#90CAF9` | `144, 202, 249` | スクロールバーサム、ボタンボーダー |
| **300** | `#64B5F6` | `100, 181, 246` | 補助アクセントカラー |
| **400** | `#42A5F5` | `66, 165, 245` | アイコン、フォーカスボーダー |
| **500** | `#2196F3` | `33, 150, 243` | **プライマリアクション、進捗バー** |
| **600** | `#1E88E5` | `30, 136, 229` | ボタンホバー、ダークモードボタン |
| **700** | `#1976D2` | `25, 118, 210` | ダークモード濃色 |
| **800** | `#1565C0` | `21, 101, 192` | ダークモード深色 |
| **900** | `#0D47A1` | `13, 71, 161` | ダークモードホバー背景 |

#### Usage Guidelines

**Light Mode:**
- **50-200**: 背景、ボーダー、スクロールバー
- **400-500**: プライマリアクション、アイコン、フォーカスリング
- **600**: ホバー状態

**Dark Mode:**
- **400**: アイコン、軽いテキスト
- **600-700**: ボタン、プライマリアクション
- **900**: 微細なホバー背景（20%透明度）

#### Tailwind Class Mapping

```tsx
// ライトモード
bg-brand-50   // 極薄背景
bg-brand-500  // プライマリボタン
text-brand-600 // プライマリテキスト
border-brand-200 // ライトボーダー

// ダークモード
dark:bg-brand-600  // プライマリボタン
dark:text-brand-400 // プライマリテキスト
dark:border-brand-600 // ダークボーダー
dark:hover:bg-brand-700 // ホバーボタン
```

### Dark Mode Color Palette

ダークモードでは、3階層の背景色システムと3階層のテキスト色システムを採用し、視覚的な奥行きと読みやすさを実現しています。

#### Background Colors (bg)

| Level | HEX | RGB | Usage |
|-------|-----|-----|-------|
| **primary** | `#0f1419` | `15, 20, 25` | ページ全体背景、サムネイル背景 |
| **secondary** | `#1a1f26` | `26, 31, 38` | カード背景、フローティングUI |
| **tertiary** | `#252b33` | `37, 43, 51` | 入力フォーム、ドロップゾーン、ボタン背景 |

**階層設計思想:**
`primary` → `secondary` → `tertiary` の順に明度が上がり、手前に来る要素ほど明るくなる「奥行き設計」を採用。各階層は約 `0a-0b` の差分で視覚的分離を確保。

```tsx
// Tailwind Usage
dark:bg-dark-bg-primary    // ページ背景
dark:bg-dark-bg-secondary  // カード背景
dark:bg-dark-bg-tertiary   // 入力フォーム、ドロップゾーン
```

#### Text Colors (text)

| Level | HEX | RGB | Contrast | Usage |
|-------|-----|-----|----------|-------|
| **primary** | `#e1e8ed` | `225, 232, 237` | AAA | メインテキスト、見出し、ラベル |
| **secondary** | `#8899a6` | `136, 153, 166` | AA | 補助テキスト、説明文 |
| **muted** | `#5b6f7a` | `91, 111, 122` | - | プレースホルダー、非活性テキスト |

**コントラスト設計:**
- **primary**: WCAG AAA準拠（21:1以上）
- **secondary**: WCAG AA準拠（4.5:1以上）
- **muted**: 意図的に低視認（非重要情報のみ）

```tsx
// Tailwind Usage
dark:text-dark-text-primary   // メインテキスト
dark:text-dark-text-secondary // 補助テキスト
dark:text-dark-text-muted     // プレースホルダー
```

#### Border Colors (border)

| Level | HEX | RGB | Usage |
|-------|-----|-----|-------|
| **light** | `#2f3942` | `47, 57, 66` | （未使用・予備定義） |
| **DEFAULT** | `#3e4a54` | `62, 74, 84` | カード、入力フォーム、スクロールバー |

```tsx
// Tailwind Usage
dark:border-dark-border       // 標準ボーダー (DEFAULT)
dark:border-dark-border-light // 微細ボーダー（予備）
```

### Light Mode Neutral Colors

ダークモード以外では、Tailwindデフォルトの `slate` パレットを使用します。

```tsx
// Background
bg-slate-50   // 極薄背景
bg-slate-100  // ページ背景
bg-white      // カード、フォーム背景

// Text
text-slate-900 // 濃いテキスト（見出し）
text-slate-800 // メインテキスト
text-slate-600 // 補助テキスト
text-slate-400 // プレースホルダー

// Border
border-slate-200 // 標準ボーダー
border-slate-300 // 破線ボーダー
```

---

## Typography

### Font Stack

OS別に最適化されたシステムフォントスタックを使用し、読み込み時間ゼロで最高の可読性を実現しています。

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

| OS | Primary Font | Fallback |
|----|--------------|----------|
| **macOS/iOS** | `-apple-system` | Helvetica Neue |
| **Windows** | `Segoe UI` | Arial |
| **Android** | `Roboto` | sans-serif |
| **Linux** | `Roboto` / `Arial` | sans-serif |

### Font Rendering

```css
body {
  -webkit-font-smoothing: antialiased; /* macOS Retina最適化 */
  -moz-osx-font-smoothing: grayscale;  /* Firefox macOS最適化 */
}
```

### Type Scale

| Usage | Tailwind Class | Size | Weight | Line Height |
|-------|----------------|------|--------|-------------|
| **Main Heading** | `text-2xl sm:text-3xl` | 24px / 30px | `font-semibold` (600) | 1.2 |
| **Section Heading** | `text-base` | 16px | `font-semibold` (600) | 1.5 |
| **Button Large** | `text-lg` | 18px | `font-semibold` (600) | 1.5 |
| **Button Small** | `text-sm` | 14px | `font-semibold` (600) | 1.5 |
| **Body Text** | `text-sm` | 14px | `font-medium` (500) | 1.5 |
| **Caption** | `text-xs` | 12px | `font-medium` (500) | 1.5 |

**Design Principle:**
すべてのテキストが `font-medium` (500) 以上の太さを持ち、視認性を重視したボールド傾向のタイポグラフィ設計。

### Responsive Typography

```tsx
// Heading: モバイル 24px → デスクトップ 30px
<h1 className="text-2xl sm:text-3xl font-semibold">
  Convert to WebP
</h1>
```

---

## UI Component Patterns

### Buttons

#### Primary Button

**用途:** メインアクション（変換実行など）

```tsx
<button
  className={clsx(
    // Base Styles
    "rounded-full px-6 py-4 text-lg font-semibold text-white transition",
    // Light Mode
    "bg-brand-500 shadow-lg hover:bg-brand-600 hover:shadow-xl",
    // Dark Mode
    "dark:bg-brand-600 dark:shadow-md dark:hover:bg-brand-700 dark:hover:shadow-lg",
    // Disabled
    disabled && "cursor-not-allowed opacity-60"
  )}
  disabled={isDisabled}
>
  Convert to WebP
</button>
```

**Visual Specs:**
- **Shape:** `rounded-full` (完全な丸角)
- **Padding:** `px-6 py-4` (24px / 16px)
- **Shadow:** カスタム `rgba(33,150,243,0.3)` または `shadow-lg`
- **Hover:** 背景色濃化 + 影拡大

#### Secondary Button

**用途:** 非破壊的アクション（Add more など）

```tsx
<button
  className="
    rounded-full border px-5 py-2 text-sm font-semibold transition
    border-brand-200 bg-white text-brand-600
    hover:border-brand-400 hover:bg-brand-50
    dark:border-brand-600 dark:bg-dark-bg-tertiary dark:text-brand-400
    dark:hover:border-brand-500 dark:hover:bg-brand-900/20
  "
>
  Add more files
</button>
```

**Visual Specs:**
- **Shape:** `rounded-full`
- **Padding:** `px-5 py-2` (20px / 8px)
- **Border:** ブランド色薄め → ホバーで濃化
- **Background:** 白/透明 → ホバーでブランド色極薄

#### Icon Button

**用途:** 削除、閉じるなどの補助アクション

```tsx
<button
  className="
    flex h-8 w-8 items-center justify-center rounded-full
    border border-transparent transition
    text-slate-400 hover:border-slate-200 hover:text-slate-600
    dark:text-dark-text-muted
    dark:hover:border-dark-border
    dark:hover:text-dark-text-secondary
    disabled:cursor-not-allowed disabled:opacity-40
  "
  disabled={isDisabled}
>
  <svg className="h-4 w-4">...</svg>
</button>
```

**Visual Specs:**
- **Size:** `h-8 w-8` (32px × 32px)
- **Shape:** `rounded-full`
- **初期状態:** 透明ボーダー + グレーアイコン
- **Hover:** ボーダー出現 + アイコン濃化

### Cards

#### File Item Card

**用途:** アップロードされたファイルの表示

```tsx
<div
  className="
    flex items-center gap-4 rounded-2xl border p-4
    shadow-sm transition
    border-slate-200 bg-white/80
    hover:shadow-md
    dark:border-dark-border dark:bg-dark-bg-tertiary/80
    dark:shadow-none dark:hover:bg-dark-bg-tertiary
  "
>
  {/* Thumbnail */}
  <img className="h-16 w-16 rounded-lg object-cover" src={previewUrl} />

  {/* Info */}
  <div className="flex-1">
    <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary">
      {file.name}
    </p>
    <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
      {sizeLabel}
    </p>
  </div>

  {/* Remove Button */}
  <button>...</button>
</div>
```

**Visual Specs:**
- **Shape:** `rounded-2xl` (16px角丸)
- **Background:** 80%透明度 → ホバーで100%
- **Shadow:** ライトモードのみ `shadow-sm` → `shadow-md`
- **Border:** `slate-200` / `dark-border`

### Form Inputs

#### Text Input

**用途:** ベースファイル名入力など

```tsx
<input
  type="text"
  placeholder="Base filename"
  className="
    w-full rounded-2xl border px-4 py-3 text-base font-medium outline-none transition
    border-slate-200 bg-white text-slate-800 placeholder:text-slate-400
    focus:border-brand-400 focus:shadow-[0_0_0_4px_rgba(33,150,243,0.12)]
    dark:border-dark-border dark:bg-dark-bg-tertiary
    dark:text-dark-text-primary dark:placeholder:text-dark-text-muted
    dark:focus:border-brand-500 dark:focus:shadow-[0_0_0_4px_rgba(33,150,243,0.2)]
  "
/>
```

**Visual Specs:**
- **Shape:** `rounded-2xl`
- **Padding:** `px-4 py-3` (16px / 12px)
- **Focus Ring:** カスタム `box-shadow` 4px、透明度12%/20%
- **Focus Border:** `brand-400` (ライト) / `brand-500` (ダーク)

### Drop Zone

**用途:** ファイルドラッグ&ドロップエリア

```tsx
<div
  className={clsx(
    "relative flex min-h-[220px] flex-col items-center justify-center gap-4 p-8",
    "rounded-2xl border border-dashed text-center transition",
    // Default State
    "border-slate-300 bg-slate-50/70",
    "hover:border-brand-400 hover:bg-white",
    "dark:border-dark-border dark:bg-dark-bg-tertiary/50",
    "dark:hover:border-brand-500 dark:hover:bg-dark-bg-secondary",
    // Active State (dragging)
    isDropActive && "border-brand-400 bg-brand-50/80 dark:border-brand-500 dark:bg-brand-900/20"
  )}
>
  <svg className="h-16 w-16 text-brand-500">...</svg>
  <p className="text-sm font-semibold">Drop images here or click to upload</p>
</div>
```

**Visual Specs:**
- **Border:** `border-dashed` (破線)
- **Drag Active:** ボーダー `brand-400`/`500` + 背景ブランド色
- **Min Height:** `min-h-[220px]`

### Progress Bar

**用途:** 変換進捗表示

```tsx
<div className="space-y-2">
  <div className="h-2 rounded-full bg-slate-200 dark:bg-dark-border">
    <div
      className="h-2 rounded-full bg-brand-500 dark:bg-brand-400 transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>
  <p className="text-xs text-slate-600 dark:text-dark-text-secondary">
    Converting {current} / {total}
  </p>
</div>
```

**Visual Specs:**
- **Height:** `h-2` (8px)
- **Track Color:** `slate-200` / `dark-border`
- **Bar Color:** `brand-500` / `brand-400`
- **Animation:** `transition-all` でスムーズ拡大

### Feedback Messages

**用途:** 成功・エラーメッセージ表示

```tsx
// Success
<div className="
  rounded-2xl px-4 py-3 text-sm font-semibold
  bg-green-50 text-green-600
  dark:bg-green-900/20 dark:text-green-400
">
  Conversion successful!
</div>

// Error
<div className="
  rounded-2xl px-4 py-3 text-sm font-semibold
  bg-red-50 text-red-600
  dark:bg-red-900/20 dark:text-red-400
">
  Error: Invalid file format
</div>
```

**Visual Specs:**
- **Shape:** `rounded-2xl`
- **Success:** 緑50/緑900透明 + 緑600/緑400テキスト
- **Error:** 赤50/赤900透明 + 赤600/赤400テキスト

---

## Layout & Spacing

### Spacing Scale (8px Grid)

Webplyzerは**8の倍数ルール**を採用し、視覚的リズムと一貫性を保っています。

| Tailwind | Value | Usage |
|----------|-------|-------|
| `gap-2` / `p-2` | 8px | 要素内の最小間隔 |
| `gap-3` / `p-3` | 12px | 小要素間隔 |
| `gap-4` / `p-4` | 16px | 標準コンポーネント間隔、カード余白 |
| `gap-6` / `p-6` | 24px | セクション内余白 |
| `gap-8` / `p-8` | 32px | セクション間隔、ドロップゾーン余白 |
| `p-10` | 40px | メインカード内側余白（デスクトップ） |
| `py-12` | 48px | メインカード縦余白 |

### Container & Card Spacing

```tsx
// Main Container
<main className="min-h-screen px-4 py-12">
  {/* Main Card */}
  <div className="mx-auto max-w-3xl rounded-3xl p-6 sm:p-10">
    {/* Sections with gap-8 */}
    <div className="space-y-8">
      {/* Components with gap-4 */}
      <div className="space-y-4">...</div>
    </div>
  </div>
</main>
```

**Pattern:**
- **外側余白:** `px-4 py-12` (16px / 48px)
- **内側余白:** `p-6 sm:p-10` (24px → 40px)
- **セクション間隔:** `space-y-8` (32px)
- **コンポーネント間隔:** `space-y-4` (16px)

### Responsive Breakpoints

Tailwindデフォルトブレークポイントを使用:

| Prefix | Min Width | Usage Example |
|--------|-----------|---------------|
| `sm:` | 640px | `text-2xl sm:text-3xl` (見出しサイズ拡大) |
| | | `p-6 sm:p-10` (カード余白拡大) |
| `md:` | 768px | `md:left-1/2 md:-translate-x-1/2` (固定ボタン中央配置) |

### Custom Shadows

```typescript
// tailwind.config.ts
boxShadow: {
  surface: "0 8px 32px rgba(33, 150, 243, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
}
```

**Note:** 現在未使用。将来的なカスタムシャドウ用の予備定義。

---

## Dark Mode Implementation

### Setup

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class', // class-based dark mode
  // ...
}

// app/layout.tsx
<html lang="en" className="dark">

// app/globals.css
:root {
  color-scheme: light dark; // OS color scheme対応
}

body {
  @apply dark:bg-dark-bg-primary dark:text-dark-text-primary;
}
```

**Strategy:**
- **Class-based:** `<html class="dark">` でグローバル制御
- **Default Dark:** 初期状態でダークモード適用
- **OS Aware:** `color-scheme` でOSのカラースキームに対応

### Color Switching Patterns

#### Background Colors

```tsx
// Page Background
"bg-slate-100 dark:bg-dark-bg-primary"

// Card Background
"bg-white dark:bg-dark-bg-secondary"

// Input/Drop Zone Background
"bg-white dark:bg-dark-bg-tertiary"

// Auxiliary Background
"bg-slate-50 dark:bg-dark-bg-tertiary"
```

#### Text Colors

```tsx
// Main Text
"text-slate-900 dark:text-dark-text-primary"
"text-slate-800 dark:text-dark-text-primary"

// Secondary Text
"text-slate-600 dark:text-dark-text-secondary"
"text-slate-500 dark:text-dark-text-secondary"

// Muted Text
"text-slate-400 dark:text-dark-text-muted"
```

#### Border Colors

```tsx
// Standard Border
"border-slate-200 dark:border-dark-border"

// Dashed Border
"border-slate-300 dark:border-dark-border"
```

#### Brand Color Adjustments

```tsx
// Icons
"text-brand-500 dark:text-brand-400"

// Buttons
"bg-brand-500 dark:bg-brand-600"

// Hover
"hover:bg-brand-600 dark:hover:bg-brand-700"
```

### Shadow Handling

```tsx
// Light Mode: 影を強調
"shadow-sm hover:shadow-md"
"shadow-lg hover:shadow-xl"

// Dark Mode: 影を抑制 or 削除
"dark:shadow-none"
"dark:shadow-md dark:hover:shadow-lg"
```

**Design Intent:**
- **Light Mode:** 影で奥行き表現
- **Dark Mode:** 色の明度差で奥行き表現（影は控えめ）

### Scrollbar Customization

```css
/* app/globals.css */
*::-webkit-scrollbar {
  width: 8px;
}

*::-webkit-scrollbar-track {
  @apply bg-brand-50 dark:bg-dark-bg-tertiary;
}

*::-webkit-scrollbar-thumb {
  @apply bg-brand-200 dark:bg-dark-border;
  border-radius: 9999px;
}
```

---

## Best Practices

### Color Selection Guidelines

1. **ブランドカラーは用途を限定**
   - プライマリアクション（ボタン、リンク）
   - アイコン、進捗バー
   - フォーカスリング、ホバー状態

2. **ニュートラルカラーを基本に**
   - テキスト: `slate-800/900` (ライト) / `dark-text-primary` (ダーク)
   - 背景: `white/slate-50` (ライト) / `dark-bg-*` (ダーク)
   - ボーダー: `slate-200/300` (ライト) / `dark-border` (ダーク)

3. **ダークモードは明度を上げる**
   - ライトモード `brand-500` → ダークモード `brand-400`
   - ライトモード `slate-600` → ダークモード `dark-text-primary`

### Component Development

1. **常にダークモード対応を意識**
   ```tsx
   // ✅ Good
   className="bg-white dark:bg-dark-bg-secondary"

   // ❌ Bad
   className="bg-white"
   ```

2. **ホバー/フォーカス状態を必ず定義**
   ```tsx
   // ✅ Good
   className="hover:bg-brand-600 focus:ring-4"

   // ❌ Bad
   className="bg-brand-500"
   ```

3. **無効状態のスタイリング**
   ```tsx
   className={clsx(
     "button-base",
     disabled && "opacity-60 cursor-not-allowed"
   )}
   ```

### Accessibility

1. **コントラスト比の確保**
   - テキスト: 最低4.5:1（AA）、推奨7:1（AAA）
   - ダークモード `dark-text-primary` は21:1以上を確保

2. **フォーカスリングの明示**
   ```tsx
   className="focus:shadow-[0_0_0_4px_rgba(33,150,243,0.12)]"
   ```

3. **アイコンボタンには aria-label を必須化**
   ```tsx
   <button aria-label="Remove file">
     <XIcon />
   </button>
   ```

### Responsive Design

1. **モバイルファースト**
   ```tsx
   // ✅ Good
   className="text-2xl sm:text-3xl"

   // ❌ Bad (デスクトップファースト)
   className="text-3xl sm:text-2xl"
   ```

2. **タッチターゲットサイズ**
   - 最小 44×44px (iOS HIG)
   - Webplyzer標準: `h-8 w-8` (32px) ～ `py-4` (min 48px)

3. **レスポンシブ余白**
   ```tsx
   className="p-6 sm:p-10"  // 24px → 40px
   ```

### Performance

1. **Tailwindクラスの最適化**
   - `@apply` を乱用せず、ユーティリティクラスを直接使用
   - 動的クラスは `clsx` でマージ

2. **Shadow/Blur の使いすぎ注意**
   - 必要最小限に留める（現在はほぼ未使用）

---

## Future Considerations

### Planned Additions

- **Light Mode Toggle**: ユーザーがライト/ダークを切り替え可能にする機能
- **Component Library**: 再利用可能なコンポーネント抽出（`components/` ディレクトリ）
- **Animation System**: `transition-all` の体系化、`motion-safe` 対応

### Unused Definitions Cleanup

以下は定義済みだが未使用のため、削除または実装を検討:

- `boxShadow.surface` (カスタムシャドウ)
- `dark.border.light` (微細ボーダー)

---

## References

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Material Design**: https://m3.material.io/styles/color/system/overview
- **WCAG Contrast**: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- **Project Docs**: `docs/index.md`

---

**End of Design System Document**
*For questions or updates, please refer to `docs/index.md` or open an issue.*
