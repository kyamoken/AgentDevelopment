# Docker構成例
# マルチステージビルドでPythonとNode.js両方をサポート

# Python環境
FROM python:3.11-slim as python-base

WORKDIR /app/python

# Python依存関係のインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY python/ .

# Node.js環境
FROM node:18-alpine as node-base

WORKDIR /app/javascript

# Node.js依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

COPY javascript/ .

# 最終イメージ
FROM python:3.11-slim

# Node.jsのインストール
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python環境をコピー
COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /usr/local/bin /usr/local/bin
COPY --from=python-base /app/python ./python

# Node.js環境をコピー
COPY --from=node-base /app/javascript ./javascript
COPY --from=node-base /app/javascript/node_modules ./javascript/node_modules

# その他のファイル
COPY package.json requirements.txt README.md ./

# ポート公開
EXPOSE 3000 8000

# 起動スクリプト
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]