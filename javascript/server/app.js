/**
 * Express.js Web サーバーデモンストレーション
 * Node.js での Web API 実装例
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア設定
app.use(helmet()); // セキュリティヘッダー
app.use(cors()); // CORS対応
app.use(morgan('combined')); // ログ出力
app.use(express.json()); // JSON パース
app.use(express.urlencoded({ extended: true })); // URL エンコード

// インメモリデータストア（デモ用）
let users = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', age: 30 },
    { id: 2, name: '佐藤花子', email: 'sato@example.com', age: 25 },
    { id: 3, name: '鈴木一郎', email: 'suzuki@example.com', age: 35 }
];

let nextId = 4;

// ルートハンドラー
app.get('/', (req, res) => {
    res.json({
        message: 'AI Agent Development Server',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            health: '/api/health',
            docs: '/api/docs'
        },
        timestamp: new Date().toISOString()
    });
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ユーザー管理API

// 全ユーザー取得
app.get('/api/users', (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    let filteredUsers = users;

    // 検索フィルター
    if (search) {
        filteredUsers = users.filter(user => 
            user.name.includes(search) || user.email.includes(search)
        );
    }

    // ページネーション
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
        data: paginatedUsers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit)
        }
    });
});

// 特定ユーザー取得
app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ 
            error: 'ユーザーが見つかりません',
            code: 'USER_NOT_FOUND'
        });
    }

    res.json({ data: user });
});

// ユーザー作成
app.post('/api/users', (req, res) => {
    const { name, email, age } = req.body;

    // バリデーション
    if (!name || !email) {
        return res.status(400).json({
            error: '名前とメールアドレスは必須です',
            code: 'VALIDATION_ERROR'
        });
    }

    // メールアドレスの重複チェック
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({
            error: 'このメールアドレスは既に使用されています',
            code: 'EMAIL_ALREADY_EXISTS'
        });
    }

    const newUser = {
        id: nextId++,
        name,
        email,
        age: age || null
    };

    users.push(newUser);

    res.status(201).json({ 
        data: newUser,
        message: 'ユーザーを作成しました'
    });
});

// ユーザー更新
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ 
            error: 'ユーザーが見つかりません',
            code: 'USER_NOT_FOUND'
        });
    }

    const { name, email, age } = req.body;

    // メールアドレスの重複チェック（自分以外）
    if (email) {
        const existingUser = users.find(u => u.email === email && u.id !== id);
        if (existingUser) {
            return res.status(409).json({
                error: 'このメールアドレスは既に使用されています',
                code: 'EMAIL_ALREADY_EXISTS'
            });
        }
    }

    // ユーザー情報更新
    if (name !== undefined) users[userIndex].name = name;
    if (email !== undefined) users[userIndex].email = email;
    if (age !== undefined) users[userIndex].age = age;

    res.json({ 
        data: users[userIndex],
        message: 'ユーザー情報を更新しました'
    });
});

// ユーザー削除
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ 
            error: 'ユーザーが見つかりません',
            code: 'USER_NOT_FOUND'
        });
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    res.json({ 
        data: deletedUser,
        message: 'ユーザーを削除しました'
    });
});

// 統計情報
app.get('/api/stats', (req, res) => {
    const totalUsers = users.length;
    const averageAge = users.reduce((sum, user) => sum + (user.age || 0), 0) / totalUsers;
    
    res.json({
        totalUsers,
        averageAge: parseFloat(averageAge.toFixed(1)),
        ageDistribution: {
            '20代': users.filter(u => u.age >= 20 && u.age < 30).length,
            '30代': users.filter(u => u.age >= 30 && u.age < 40).length,
            '40代以上': users.filter(u => u.age >= 40).length
        }
    });
});

// API ドキュメント
app.get('/api/docs', (req, res) => {
    res.json({
        title: 'AI Agent Development API Documentation',
        version: '1.0.0',
        endpoints: [
            {
                method: 'GET',
                path: '/api/users',
                description: 'ユーザー一覧取得',
                parameters: ['page', 'limit', 'search']
            },
            {
                method: 'GET',
                path: '/api/users/:id',
                description: '特定ユーザー取得'
            },
            {
                method: 'POST',
                path: '/api/users',
                description: 'ユーザー作成',
                body: { name: 'string', email: 'string', age: 'number' }
            },
            {
                method: 'PUT',
                path: '/api/users/:id',
                description: 'ユーザー更新'
            },
            {
                method: 'DELETE',
                path: '/api/users/:id',
                description: 'ユーザー削除'
            },
            {
                method: 'GET',
                path: '/api/stats',
                description: '統計情報取得'
            }
        ]
    });
});

// エラーハンドリング
app.use((req, res) => {
    res.status(404).json({
        error: 'エンドポイントが見つかりません',
        code: 'ENDPOINT_NOT_FOUND'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'サーバー内部エラー',
        code: 'INTERNAL_SERVER_ERROR'
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
    console.log(`📚 API ドキュメント: http://localhost:${PORT}/api/docs`);
    console.log(`❤️  ヘルスチェック: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
});

module.exports = app;