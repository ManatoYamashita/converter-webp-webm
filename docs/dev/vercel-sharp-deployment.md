# Vercel sharp デプロイエラー解決ガイド

## 問題の概要

Vercelにデプロイした際、sharpモジュールがLinux x64ランタイムでロードできないエラーが発生。

**エラーメッセージ**:
```
Error: Could not load the "sharp" module using the linux-x64 runtime
Possible solutions:
- Ensure optional dependencies can be installed:
    npm install --include=optional sharp
- Ensure your package manager supports multi-platform installation:
    See https://sharp.pixelplumbing.com/install#cross-platform
- Add platform-specific dependencies:
    npm install --os=linux --cpu=x64 sharp
```

## 発生環境

- **日時**: 2025-11-24
- **Next.js**: 16.0.3
- **sharp**: ^0.33.3
- **Vercel リージョン**: Washington, D.C., USA (iad1)
- **開発環境**: macOS ARM64

## 試行錯誤の記録

### 第1回デプロイ（失敗）

**実施内容**:
- `vercel.json` 作成（runtime: "nodejs20.x"）
- `.npmrc` 作成（sharp_binary_host 設定）

**結果**: `Error: Function Runtimes must have a valid version, for example 'now-php@1.0.0'`

**原因**: vercel.json の `runtime: "nodejs20.x"` フォーマットが不正。Next.js 16 では、API route に `export const runtime = "nodejs"` を直接記述する方式が推奨される。

### 第2回デプロイ（失敗）

**実施内容**:
- `vercel.json` を削除（`app/api/convert/route.ts` に既に `export const runtime = "nodejs"` 設定あり）
- `.npmrc` のみ維持

**結果**: sharp エラー継続

**原因**: `.npmrc` の設定だけでは、Vercel ビルド環境でLinux x64バイナリが正しくインストールされない。

### 第3回デプロイ（失敗）

**実施内容**:
- `next.config.mjs` の `experimental` セクション内に `serverExternalPackages: ["sharp"]` を追加

**結果**: ビルド警告 `⚠ Invalid next.config.mjs options detected: Unrecognized key(s) in object: 'serverExternalPackages' at "experimental"`

**原因**: Next.js 16 では `serverExternalPackages` は安定した標準設定であり、`experimental` セクション外（トップレベル）に配置すべき。

### 第4回デプロイ（失敗）

**実施内容**:
- `serverExternalPackages: ["sharp"]` をトップレベルに移動

**結果**: 設定警告は消えたが、sharp エラー継続

**原因**: `serverExternalPackages` 設定は認識されているが、Vercel ビルド環境でsharpのオプショナル依存関係（Linux x64バイナリ）が正しくインストールされていない。

### 第5回デプロイ（成功）

**実施内容**:
- `package.json` に `postinstall` スクリプト追加
- `.npmrc` に `sharp_install_force=true` 追加

**結果**: デプロイ成功

## 最終的な解決方法

以下の3つのファイルを変更することで解決：

### 1. `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["sortablejs"],
  },
  serverExternalPackages: ["sharp"], // トップレベルに配置
};

export default nextConfig;
```

**重要**: `serverExternalPackages` は Next.js 16 では `experimental` セクション外のトップレベル設定です。

### 2. `.npmrc`

```
sharp_binary_host=https://github.com/lovell/sharp-libvips/releases/download/
sharp_libvips_binary_host=https://github.com/lovell/sharp-libvips/releases/download/
sharp_install_force=true
```

**追加項目**: `sharp_install_force=true` でsharpのインストールを強制。

### 3. `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "postinstall": "npm install --include=optional sharp"
  }
}
```

**追加項目**: `postinstall` スクリプトでオプショナル依存関係を明示的にインストール。

## 根本原因の技術的説明

### 問題1: Turbopack のバンドル問題

Next.js 16 の Turbopack は、デフォルトで sharp をバンドルしようとします。しかし、sharp はネイティブモジュール（C++バインディング）のため、バンドルすると開発環境（macOS）のバイナリパスが埋め込まれ、Vercel の Linux 環境で動作しません。

**解決**: `serverExternalPackages: ["sharp"]` でバンドル対象から除外し、Node.js の標準 `require` を使用させる。

### 問題2: クロスプラットフォーム依存関係

macOS ARM64 環境で開発している場合、`node_modules/sharp` には darwin-arm64 バイナリのみが含まれます。Vercel の Linux x64 環境では、Linux x64 バイナリが必要です。

通常、npm は NFT (Node File Trace) を使用してデプロイに必要なファイルを検出しますが、クロスプラットフォームのバイナリは自動的には含まれません。

**解決**: `postinstall` スクリプトで `npm install --include=optional sharp` を実行し、Vercel ビルド時に Linux x64 バイナリを強制インストール。

### 問題3: オプショナル依存関係のインストール

npm のデフォルト動作では、プラットフォーム固有のオプショナル依存関係がスキップされる場合があります。特に、Vercel のビルド環境では `--omit=optional` が暗黙的に適用されることがあります。

**解決**:
- `--include=optional` フラグで明示的にインストール
- `.npmrc` で `sharp_install_force=true` を設定し、sharpのインストールを強制

## 今後の参考情報

### Next.js 16 での serverExternalPackages

- **配置**: トップレベル（`experimental` セクション外）
- **目的**: ネイティブモジュールをバンドル対象から除外
- **対象パッケージ例**:
  - `sharp` (画像処理)
  - `ffmpeg-static` (動画処理)
  - `heic-convert` (HEIC変換)
  - その他、C++バインディングを持つパッケージ

### Vercel デプロイ時の sharp ベストプラクティス

1. `serverExternalPackages: ["sharp"]` を `next.config.mjs` のトップレベルに設定
2. `.npmrc` で `sharp_install_force=true` を設定
3. `postinstall` スクリプトで `npm install --include=optional sharp` を実行

この3つの設定を組み合わせることで、クロスプラットフォーム環境でも確実に動作します。

### 参考リンク

- [Next.js serverExternalPackages Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages)
- [sharp Installation Guide](https://sharp.pixelplumbing.com/install)
- [sharp Cross-Platform Guide](https://sharp.pixelplumbing.com/install#cross-platform)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)

## 関連コミット

- `cb6c365`: serverExternalPackages をトップレベルに移動（Next.js 16標準設定）
- `46923b9`: postinstall スクリプト + .npmrc 強化（最終解決）

---

最終更新日: 2025-11-24
