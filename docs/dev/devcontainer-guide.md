# Devcontainer開発ガイド

## 概要

本プロジェクトはVS Code Dev Containersに対応しています。Docker環境で開発することで、ホストOSに依存せず一貫した開発体験を提供します。

## 前提条件

- **Docker Desktop**（macOS/Windows）または**Docker Engine**（Linux）
- **VS Code** + **Dev Containers拡張機能**
- 最低8GBのメモリ（推奨16GB）
- ディスク空き容量: 最低10GB（初回ビルド用）

## セットアップ手順

### 1. Devcontainerを起動

```bash
# 1. VS Codeでプロジェクトを開く
code .

# 2. Command Palette（Cmd+Shift+P / Ctrl+Shift+P）を開く

# 3. "Dev Containers: Reopen in Container" を実行

# 4. 初回ビルド（5-10分）を待つ
#    - Dockerfileのビルド
#    - npm installの自動実行
#    - VS Code拡張機能のインストール
```

### 2. 動作確認

コンテナ起動後、ターミナルで以下を確認：

```bash
# Node.jsバージョン確認（20.9.0であること）
node --version
# 出力: v20.9.0

# npmバージョン確認
npm --version
# 出力: 10.x.x

# FFmpegインストール確認
ffmpeg -version
# 出力: ffmpeg version 6.x.x

# Python3インストール確認
python3 --version
# 出力: Python 3.11.x

# libvips確認（sharp用）
pkg-config --modversion vips
# 出力: 8.x.x

# 現在のユーザー確認（nodeであること）
whoami
# 出力: node
```

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセス。ファイルアップロード画面が表示されればOKです。

### 4. ビルド・Lint確認

```bash
# ビルド確認
npm run build
# 期待結果: .next/ ディレクトリにビルド成果物が生成される

# Lint確認
npm run lint
# 期待結果: エラーなく完了
```

## 技術仕様

### コンテナ環境

| 項目 | 値 |
|------|-----|
| **ベースイメージ** | `node:20.9.0-bookworm` |
| **OS** | Debian 12 (Bookworm) |
| **Node.js** | 20.9.0 |
| **npm** | 10.x |
| **ユーザー** | `node` (UID 1000, GID 1000) |
| **作業ディレクトリ** | `/workspace` |

### システム依存関係

| パッケージ | 用途 | バージョン |
|-----------|------|-----------|
| **FFmpeg** | 動画変換（WebM） | 6.x |
| **libvips-dev** | sharpのネイティブビルド | 8.x |
| **libheif-dev** | HEIC/HEIF変換 | 1.x |
| **build-essential** | ネイティブビルドツール | - |
| **python3** | ネイティブビルド補助 | 3.11.x |
| **git** | バージョン管理 | 2.x |

### Named Volume（パフォーマンス最適化）

```yaml
volumes:
  node_modules:
    driver: local
```

`node_modules`をNamed Volumeとしてコンテナ内Linuxファイルシステムに配置することで、ホストOSとのI/O遅延を防ぎます。これにより：

- **`npm install`が10倍以上高速化**（macOS/Windows環境）
- `node_modules`の読み込みも高速化
- ホストOSの`node_modules`ディレクトリは空（または存在しない）

### インストールされるVS Code拡張機能

以下の拡張機能が自動的にインストールされます：

| 拡張機能 | 用途 |
|---------|------|
| **ESLint** | リンター（ESLint v9対応） |
| **Tailwind CSS IntelliSense** | Tailwindクラス名補完 |
| **Prettier** | コードフォーマッター |
| **Docker** | Docker管理 |
| **GitLens** | Git履歴表示 |
| **Markdown All in One** | Markdown編集 |
| **Error Lens** | エラー表示強化 |
| **EditorConfig** | EditorConfig対応 |

### 環境変数

```env
NODE_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000
```

## トラブルシューティング

### 問題1: FFmpegが見つからない

**症状**：
```bash
fluent-ffmpeg: FFmpeg not found
```

**解決策**：
```bash
# Dockerfileを確認し、再ビルド
# Command Palette → "Dev Containers: Rebuild Container"
```

### 問題2: sharpのビルドエラー

**症状**：
```bash
npm ERR! sharp: Installation error
```

**解決策**：
```bash
# libvips-devがインストールされているか確認
pkg-config --modversion vips

# 再インストール
npm install --include=optional sharp
```

### 問題3: node_modulesのパーミッションエラー

**症状**：
```bash
EACCES: permission denied, mkdir '/workspace/node_modules'
```

**解決策**：
```dockerfile
# Dockerfileに以下を追加（USER node の前）
RUN mkdir -p /workspace/node_modules && chown -R node:node /workspace
```

その後、再ビルド：
```bash
# Command Palette → "Dev Containers: Rebuild Container"
```

### 問題4: ポート3000が使用できない

**症状**：
```bash
Error: Port 3000 is already in use
```

**解決策**：

**ホストOSで実行中のプロセスを確認**：
```bash
lsof -i :3000
```

**または docker-compose.yml でポート変更**：
```yaml
ports:
  - "3001:3000"  # ホストOSの3001番ポートを使用
```

### 問題5: Named Volumeが機能しない

**症状**：
```bash
# npm install が非常に遅い
# node_modules がホストOSに同期される
```

**解決策**：
```bash
# Named Volumeを削除して再作成
docker volume rm converter-webp-webm_node_modules

# Dev Containers: Rebuild Container で再ビルド
```

### 問題6: コンテナが起動しない

**症状**：
```bash
# コンテナビルドエラー
```

**解決策**：
```bash
# Docker Desktopを再起動

# キャッシュをクリアして再ビルド
# Command Palette → "Dev Containers: Rebuild Container Without Cache"
```

## 詳細設定

### Dockerfileの構造

```dockerfile
FROM node:20.9.0-bookworm

# ネイティブビルドツールとFFmpegのインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    libvips-dev \
    libheif-dev \
    ffmpeg \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# FFmpegインストール確認
RUN ffmpeg -version

# 非rootユーザーに切り替え
USER node

# 作業ディレクトリ設定
WORKDIR /workspace

CMD ["/bin/bash"]
```

### docker-compose.ymlのポイント

```yaml
volumes:
  # プロジェクトルートをマウント（cached: macOSパフォーマンス向上）
  - ..:/workspace:cached

  # node_modules を Named Volume として永続化（I/O遅延防止）
  - node_modules:/workspace/node_modules
```

- **`:cached`マウント**: macOSでのファイル同期パフォーマンスを向上
- **Named Volume**: `node_modules`をホストOSから分離

### devcontainer.jsonのカスタマイズ

```json
{
  "postCreateCommand": "npm install",
  "remoteUser": "node",
  "forwardPorts": [3000]
}
```

- **`postCreateCommand`**: 初回のみ`npm install`を自動実行
- **`remoteUser`**: 非rootユーザー（`node`）で統一
- **`forwardPorts`**: ポート3000を自動フォワーディング

## 将来の拡張

このDevcontainer設計は、以下の将来的な拡張に対応できます：

### データベース追加

```yaml
# docker-compose.yml に追加
postgres:
  image: postgres:16-alpine
  ports:
    - "5432:5432"
  environment:
    POSTGRES_USER: converter
    POSTGRES_PASSWORD: converter
    POSTGRES_DB: converter_dev
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### Redis追加

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
```

## 参考情報

- **VS Code Dev Containers**: https://code.visualstudio.com/docs/devcontainers/containers
- **Node.js公式イメージ**: https://hub.docker.com/_/node
- **Docker Compose**: https://docs.docker.com/compose/

## まとめ

このDevcontainer環境により、以下のメリットが得られます：

- **一貫した開発環境**: ホストOSに依存しない
- **高速なnpm install**: Named Volumeによる最適化
- **ネイティブビルド対応**: sharp、heic-convert、FFmpegに完全対応
- **自動セットアップ**: VS Code拡張機能の自動インストール
- **セキュリティ**: 非rootユーザーで実行

問題が発生した場合は、上記のトラブルシューティングを参照してください。

---

最終更新日: 2025-12-10
