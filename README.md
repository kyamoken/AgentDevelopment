# AgentDevelopment
Agentを使った開発テスト用リポジトリ
# 技術仕様書：リアルタイムチャットアプリ

## 1. 概要
モバイル向けに React Native で開発し、VPS 上の Nginx リバースプロキシを通じて Node.js バックエンド（WebSocket/API）と通信。データは同 VPS 上の PostgreSQL に保存。リアルタイム性を担保しつつ、セキュアでスケーラブルな構成を想定。

---

## 2. 全体アーキテクチャ
```
[React Native App]
        │ HTTPS/WebSocket (wss://)
        ▼
     [Nginx]
        │ ──── API/WS ────▶ [Node.js + Express + ws/Socket.IO]
                                     │
                                     └───▶ [PostgreSQL (TypeORM)]
```

---

## 3. フロントエンド（モバイルアプリ）
- フレームワーク：React Native（>=0.75）
- 言語：TypeScript
- 状態管理：Redux Toolkit（または Zustand）
- ネットワーク：  
  - REST API：axios  
  - WebSocket：Socket.IO-client または native WebSocket API
- UI コンポーネント：React Native Paper / React Native Elements
- ルーティング：React Navigation
- スタイル：Styled-Components または React Native StyleSheet
- フォルダ構成例：
  - `src/`
    - `components/`
    - `screens/`
    - `store/`
    - `services/`
    - `utils/`
    - `assets/`

---

## 4. バックエンド
- ランタイム：Node.js（>=18.x）
- フレームワーク：Express.js
- WebSocket：Socket.IO または `ws` モジュール
- ORM：TypeORM（または Prisma）
- データベース：PostgreSQL
- 環境変数管理：dotenv
- バリデーション：class-validator（TypeORM 連携）
- ロギング：Winston または Pino
- フォルダ構成例：
  - `src/`
    - `controllers/`
    - `services/`
    - `models/`
    - `routes/`
    - `middlewares/`
    - `config/`
    - `utils/`

---

## 5. データベース設計（概要）
- テーブル例：
  - `users`  
    - id (PK), username, password_hash, avatar_url, created_at, updated_at
  - `conversations`  
    - id (PK), title（任意）, created_at, updated_at
  - `participants`  
    - user_id (FK), conversation_id (FK)
  - `messages`  
    - id (PK), conversation_id (FK), sender_id (FK), content, created_at
- マイグレーション：TypeORM マイグレーション機能 or Umzug

---

## 6. リバースプロキシ／デプロイ
- Web サーバ：Nginx
  - HTTPS (Let’s Encrypt)
  - `/api/` → バックエンドコンテナ or PM2 プロセス
  - `/ws/` → WebSocket エンドポイント
  - 静的アセット（必要時）配信
- プロセスマネージャ：PM2 or Docker Compose
- CI/CD：GitHub Actions
  - Lint／型チェック
  - ユニットテスト／E2E テスト
  - デプロイメント（SSH → VPS、または Docker Hub → サーバーpull）

---

## 7. セキュリティ
- 認証・認可：JWT（アクセストークン＋リフレッシュトークン）
- パスワード保存：bcrypt
- HTTPS/TLS：必須
- CORS：ホワイトリスト設定
- WebSocket セキュリティ：トークン検証ミドルウェア
- SQL インジェクション防止：プリペアドステートメント（ORM 利用）
- 環境変数：機密情報は .env で管理し、リポジトリには含めない

---

## 8. テスト
- ユニットテスト：Jest + ts-jest
- コンポーネントテスト：React Native Testing Library
- E2E テスト：Detox または Appium
- CI 連携：GitHub Actions ワークフロー

---

## 9. ロギング＆モニタリング
- ログ収集：Winston → ファイル or 外部ログサービス（Datadog, LogDNA）
- アプリパフォーマンス：Sentry（エラー監視）、または Firebase Crashlytics
- メトリクス：Prometheus + Grafana（必要に応じて）

---

## 10. 開発フロー
1. Git Flow / GitHub Flow を採用  
2. feature ブランチ → PR → Code Review → main マージ  
3. CI 通過後、自動デプロイ or ステージング環境へデプロイ  

---

## 11. 今後の拡張
- プッシュ通知（Firebase Cloud Messaging）
- ファイル/画像共有機能（S3 等）
- オンラインステータス表示  
- グループ管理機能  
- メディアメッセージ対応  

---

以上をベースにリポジトリを構成し、README へリンクを貼る形で導入してください。````
