# Android実機での開発設定

## 概要
このプロジェクトはReact Native + Expoで構築されており、Android実機でテストする際にパス設定が必要です。

## 設定手順

### 1. 開発マシンのIPアドレスを確認
開発マシンで以下のコマンドを実行してIPアドレスを確認してください：

**Linux/Mac:**
```bash
ifconfig
```

**Windows:**
```cmd
ipconfig
```

ローカルネットワークのIPアドレスをメモしてください（例: `192.168.1.100`）

### 2. 設定ファイルの更新
`frontend/src/config/development.ts` ファイルを開き、以下の行を編集してください：

```typescript
export const DEVELOPMENT_CONFIG = {
  // 開発マシンのIPアドレス（Android実機からアクセスするため）
  ANDROID_DEVICE_IP: '192.168.1.100', // ← ここを実際のIPアドレスに変更
  API_PORT: 3000,
  DEBUG_MODE: true,
};
```

### 3. ネットワーク接続の確認
- Android実機と開発マシンが同じWiFiネットワークに接続されていることを確認
- ファイアウォールでポート3000が開放されていることを確認

### 4. バックエンドの起動
バックエンドサーバーが起動していることを確認してください：

```bash
cd backend
npm start
```

### 5. フロントエンドの起動
フロントエンドを起動してAndroid実機でテスト：

```bash
cd frontend
npm run android
```

## トラブルシューティング

### 接続エラーが発生する場合
1. IPアドレスが正しく設定されているか確認
2. バックエンドサーバーが起動しているか確認
3. ファイアウォールの設定を確認
4. 同じWiFiネットワークに接続されているか確認

### デバッグ情報の確認
アプリ起動時にコンソールに環境情報が出力されます。以下を確認してください：
- `androidDeviceIp`: 設定したIPアドレス
- `apiUrl`: APIのURL
- `socketUrl`: ソケットのURL

## 注意事項
- Android Emulatorを使用する場合は、IPアドレスを `10.0.2.2` に設定してください
- 本番環境では、適切なドメイン名に変更してください