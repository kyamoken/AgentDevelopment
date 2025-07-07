#!/bin/bash

# Docker entrypoint script
# Python と Node.js 両方のアプリケーションを起動

set -e

echo "🚀 AI Agent Development Environment Starting..."

# 環境変数の設定
export PYTHONPATH="/app/python:$PYTHONPATH"
export NODE_PATH="/app/javascript/node_modules:$NODE_PATH"

# ヘルスチェック関数
health_check() {
    echo "💚 システムヘルスチェック"
    echo "Python: $(python --version)"
    echo "Node.js: $(node --version)"
    echo "NPM: $(npm --version)"
    echo "メモリ使用量: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "ディスク使用量: $(df -h / | tail -1 | awk '{print $3 "/" $2}')"
}

# アプリケーション起動関数
start_applications() {
    echo "🐍 Python APIサーバーを起動中..."
    cd /app/python/api
    python main.py &
    PYTHON_PID=$!
    
    echo "🟨 Node.js Webサーバーを起動中..."
    cd /app/javascript/server
    node app.js &
    NODE_PID=$!
    
    echo "📊 データ処理デモを実行中..."
    cd /app/python/data_processing
    python processor.py &
    
    echo "🛠️ JavaScriptユーティリティデモを実行中..."
    cd /app/javascript/utils
    node helpers.js &
    
    # プロセス監視
    wait $PYTHON_PID $NODE_PID
}

# シグナルハンドラー
cleanup() {
    echo "🛑 アプリケーションを停止中..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# メイン実行
case "$1" in
    "health")
        health_check
        ;;
    "python")
        echo "🐍 Python環境のみ起動"
        cd /app/python/api
        python main.py
        ;;
    "node")
        echo "🟨 Node.js環境のみ起動"
        cd /app/javascript/server
        node app.js
        ;;
    "demo")
        echo "📋 デモンストレーション実行"
        health_check
        cd /app/python/data_processing && python processor.py
        cd /app/javascript/utils && node helpers.js
        ;;
    *)
        health_check
        start_applications
        ;;
esac