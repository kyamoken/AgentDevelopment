// 開発環境の設定
// Android実機でテストする際は、このIPアドレスを開発マシンの実際のIPアドレスに変更してください

export const DEVELOPMENT_CONFIG = {
  // 開発マシンのIPアドレス（Android実機からアクセスするため）
  // 例: '192.168.1.100', '10.0.2.2' (Android Emulatorの場合)
  ANDROID_DEVICE_IP: '192.168.1.100',
  
  // バックエンドのポート番号
  API_PORT: 3000,
  
  // デバッグモード
  DEBUG_MODE: true,
};

// IPアドレスの取得方法:
// 1. 開発マシンで `ipconfig` (Windows) または `ifconfig` (Mac/Linux) を実行
// 2. ローカルネットワークのIPアドレスを確認（例: 192.168.1.100）
// 3. 上記の ANDROID_DEVICE_IP をそのIPアドレスに変更
// 4. Android実機と開発マシンが同じWiFiネットワークに接続されていることを確認