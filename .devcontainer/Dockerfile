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
