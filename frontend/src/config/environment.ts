import { Platform } from 'react-native';
import { DEVELOPMENT_CONFIG } from './development';

// 開発環境の判定
declare const __DEV__: boolean;
const isDevelopment = __DEV__;

// Android実機の場合のIPアドレス（開発マシンのIPアドレスに変更してください）
const ANDROID_DEVICE_IP = DEVELOPMENT_CONFIG.ANDROID_DEVICE_IP;

// API URLの設定
export const getApiBaseUrl = (): string => {
  if (isDevelopment) {
    if (Platform.OS === 'android') {
      // Android実機の場合
      return `http://${ANDROID_DEVICE_IP}:${DEVELOPMENT_CONFIG.API_PORT}/api`;
    } else {
      // iOSシミュレーターやWebの場合
      return `http://localhost:${DEVELOPMENT_CONFIG.API_PORT}/api`;
    }
  } else {
    // 本番環境の場合
    return 'https://your-production-api.com/api';
  }
};

// Socket URLの設定
export const getSocketUrl = (): string => {
  if (isDevelopment) {
    if (Platform.OS === 'android') {
      // Android実機の場合
      return `http://${ANDROID_DEVICE_IP}:${DEVELOPMENT_CONFIG.API_PORT}`;
    } else {
      // iOSシミュレーターやWebの場合
      return `http://localhost:${DEVELOPMENT_CONFIG.API_PORT}`;
    }
  } else {
    // 本番環境の場合
    return 'https://your-production-api.com';
  }
};

// 設定の確認用
export const getEnvironmentInfo = () => {
  return {
    isDevelopment,
    platform: Platform.OS,
    apiUrl: getApiBaseUrl(),
    socketUrl: getSocketUrl(),
    androidDeviceIp: ANDROID_DEVICE_IP,
    apiPort: DEVELOPMENT_CONFIG.API_PORT,
  };
};

// デバッグ用：設定情報をコンソールに出力
export const logEnvironmentInfo = () => {
  if (DEVELOPMENT_CONFIG.DEBUG_MODE) {
    console.log('Environment Info:', getEnvironmentInfo());
  }
};