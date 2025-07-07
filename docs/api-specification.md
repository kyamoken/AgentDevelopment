# API 仕様書

## 概要

このドキュメントは、AI Agent Development プロジェクトで提供される API の詳細仕様を記述しています。

## Base URL

```
Python API: http://localhost:8000
Node.js API: http://localhost:3000/api
```

## 認証

現在のデモ版では認証は実装されていません。本番環境では JWT トークンベースの認証を推奨します。

## Python API (FastAPI)

### タスク管理エンドポイント

#### GET /tasks
タスク一覧を取得

**パラメータ:**
- `completed` (boolean, optional): 完了状態でフィルター
- `limit` (integer, optional): 取得件数制限 (1-1000, デフォルト: 100)
- `offset` (integer, optional): オフセット (デフォルト: 0)

**レスポンス例:**
```json
[
  {
    "id": 1,
    "title": "APIドキュメント作成",
    "description": "FastAPIの自動生成ドキュメントを確認",
    "completed": false,
    "created_at": "2023-07-07T10:00:00",
    "updated_at": "2023-07-07T10:00:00"
  }
]
```

#### GET /tasks/{task_id}
特定のタスクを取得

**パラメータ:**
- `task_id` (integer): タスクID

**レスポンス:**
- 200: タスク情報
- 404: タスクが見つからない

#### POST /tasks
新しいタスクを作成

**リクエストボディ:**
```json
{
  "title": "新しいタスク",
  "description": "タスクの詳細説明"
}
```

**レスポンス:**
- 201: 作成されたタスク情報

#### PUT /tasks/{task_id}
タスクを更新

**リクエストボディ:**
```json
{
  "title": "更新されたタイトル",
  "description": "更新された説明",
  "completed": true
}
```

#### DELETE /tasks/{task_id}
タスクを削除

**レスポンス:**
- 200: 削除成功メッセージ

#### GET /tasks/stats/summary
タスクの統計情報を取得

**レスポンス例:**
```json
{
  "total_tasks": 10,
  "completed_tasks": 3,
  "pending_tasks": 7,
  "completion_rate": 30.0
}
```

#### POST /tasks/batch
複数のタスクを一括作成

**リクエストボディ:**
```json
[
  {
    "title": "タスク1",
    "description": "説明1"
  },
  {
    "title": "タスク2",
    "description": "説明2"
  }
]
```

### システムエンドポイント

#### GET /
ルートエンドポイント - API情報を返す

#### GET /health
ヘルスチェック - システムの状態を確認

## Node.js API (Express)

### ユーザー管理エンドポイント

#### GET /api/users
ユーザー一覧を取得

**クエリパラメータ:**
- `page` (integer): ページ番号 (デフォルト: 1)
- `limit` (integer): 1ページあたりの件数 (デフォルト: 10)
- `search` (string): 検索キーワード

**レスポンス例:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "age": 30
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

#### GET /api/users/{id}
特定のユーザーを取得

#### POST /api/users
新しいユーザーを作成

**リクエストボディ:**
```json
{
  "name": "新規ユーザー",
  "email": "new@example.com",
  "age": 25
}
```

**バリデーション:**
- `name`: 必須
- `email`: 必須、ユニーク
- `age`: オプション

#### PUT /api/users/{id}
ユーザー情報を更新

#### DELETE /api/users/{id}
ユーザーを削除

#### GET /api/stats
ユーザー統計情報を取得

**レスポンス例:**
```json
{
  "totalUsers": 3,
  "averageAge": 30.0,
  "ageDistribution": {
    "20代": 1,
    "30代": 2,
    "40代以上": 0
  }
}
```

#### GET /api/health
システムヘルスチェック

**レスポンス例:**
```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "memory": {
    "rss": 45678,
    "heapTotal": 25678,
    "heapUsed": 15678
  },
  "timestamp": "2023-07-07T10:00:00.000Z"
}
```

#### GET /api/docs
API ドキュメント情報を取得

## エラーレスポンス

全てのエラーレスポンスは以下の形式です：

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE"
}
```

### 一般的なエラーコード

- `VALIDATION_ERROR`: バリデーションエラー (400)
- `NOT_FOUND`: リソースが見つからない (404)
- `CONFLICT`: 競合エラー (409)
- `INTERNAL_SERVER_ERROR`: サーバー内部エラー (500)

## レート制限

現在のデモ版ではレート制限は実装されていません。本番環境では適切なレート制限を設定することを推奨します。

## セキュリティ

- すべてのAPIでCORSが有効化されています
- Helmet.jsによるセキュリティヘッダーが設定されています
- 入力値のバリデーションが実装されています

## OpenAPI/Swagger

Python API (FastAPI) では自動生成されたAPIドキュメントを以下で確認できます：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## サンプルリクエスト

### cURLを使用した例

```bash
# タスク一覧取得
curl -X GET "http://localhost:8000/tasks"

# 新しいタスク作成
curl -X POST "http://localhost:8000/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "新しいタスク", "description": "説明"}'

# ユーザー一覧取得
curl -X GET "http://localhost:3000/api/users"

# 新しいユーザー作成
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name": "テストユーザー", "email": "test@example.com", "age": 30}'
```

### JavaScriptを使用した例

```javascript
// Fetch APIを使用
const response = await fetch('http://localhost:8000/tasks');
const tasks = await response.json();

// 新しいタスクを作成
const newTask = await fetch('http://localhost:8000/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '新しいタスク',
    description: 'タスクの説明'
  })
});
```

## 今後の拡張予定

- JWT認証の実装
- リアルタイム通信 (WebSocket)
- ファイルアップロード機能
- 詳細なログ機能
- データベース永続化