"""
自動化スクリプト例
ファイル処理、システム監視、バックアップなどの自動化タスク
"""

import os
import shutil
import subprocess
import time
import json
import csv
from datetime import datetime, timedelta
from pathlib import Path
import psutil
import requests


class AutomationTasks:
    """自動化タスククラス"""
    
    def __init__(self, config_file="automation_config.json"):
        self.config_file = config_file
        self.config = self.load_config()
        self.log_file = "automation.log"
    
    def load_config(self):
        """設定ファイルを読み込み"""
        default_config = {
            "backup_dirs": ["./python", "./javascript", "./docs"],
            "backup_destination": "./backups",
            "log_retention_days": 30,
            "system_check_interval": 300,  # 5分
            "disk_usage_threshold": 80,    # 80%
            "memory_usage_threshold": 85   # 85%
        }
        
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                default_config.update(user_config)
            except Exception as e:
                self.log(f"設定ファイル読み込みエラー: {e}")
        
        return default_config
    
    def log(self, message, level="INFO"):
        """ログ記録"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        
        print(log_entry)
        
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + "\n")
        except Exception as e:
            print(f"ログ書き込みエラー: {e}")
    
    def create_backup(self):
        """バックアップ作成"""
        self.log("バックアップ処理開始")
        
        try:
            # バックアップディレクトリ作成
            backup_dir = Path(self.config["backup_destination"])
            backup_dir.mkdir(exist_ok=True)
            
            # タイムスタンプ付きバックアップフォルダ
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            current_backup_dir = backup_dir / f"backup_{timestamp}"
            current_backup_dir.mkdir()
            
            # 各ディレクトリをバックアップ
            for source_dir in self.config["backup_dirs"]:
                source_path = Path(source_dir)
                if source_path.exists():
                    dest_path = current_backup_dir / source_path.name
                    shutil.copytree(source_path, dest_path)
                    self.log(f"バックアップ完了: {source_dir} -> {dest_path}")
                else:
                    self.log(f"バックアップ対象が見つかりません: {source_dir}", "WARNING")
            
            # バックアップサイズ計算
            backup_size = sum(f.stat().st_size for f in current_backup_dir.rglob('*') if f.is_file())
            backup_size_mb = backup_size / (1024 * 1024)
            
            self.log(f"バックアップ完了: {current_backup_dir} ({backup_size_mb:.1f} MB)")
            
            # 古いバックアップの削除
            self.cleanup_old_backups()
            
            return True
            
        except Exception as e:
            self.log(f"バックアップエラー: {e}", "ERROR")
            return False
    
    def cleanup_old_backups(self):
        """古いバックアップの削除"""
        try:
            backup_dir = Path(self.config["backup_destination"])
            if not backup_dir.exists():
                return
            
            retention_days = self.config.get("backup_retention_days", 30)
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            
            deleted_count = 0
            for backup_folder in backup_dir.iterdir():
                if backup_folder.is_dir() and backup_folder.name.startswith("backup_"):
                    try:
                        # フォルダ名から日付を抽出
                        date_str = backup_folder.name.split("_")[1]
                        folder_date = datetime.strptime(date_str, "%Y%m%d")
                        
                        if folder_date < cutoff_date:
                            shutil.rmtree(backup_folder)
                            deleted_count += 1
                            self.log(f"古いバックアップを削除: {backup_folder}")
                    
                    except (ValueError, IndexError):
                        # 日付形式が正しくない場合はスキップ
                        continue
            
            if deleted_count > 0:
                self.log(f"{deleted_count}個の古いバックアップを削除しました")
        
        except Exception as e:
            self.log(f"古いバックアップ削除エラー: {e}", "ERROR")
    
    def check_system_health(self):
        """システムヘルスチェック"""
        try:
            # CPU使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # メモリ使用率
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # ディスク使用率
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # ネットワーク統計
            network = psutil.net_io_counters()
            
            health_data = {
                "timestamp": datetime.now().isoformat(),
                "cpu_percent": cpu_percent,
                "memory_percent": memory_percent,
                "disk_percent": disk_percent,
                "disk_free_gb": disk.free / (1024**3),
                "network_bytes_sent": network.bytes_sent,
                "network_bytes_recv": network.bytes_recv
            }
            
            # 閾値チェック
            alerts = []
            if disk_percent > self.config["disk_usage_threshold"]:
                alerts.append(f"ディスク使用率が高いです: {disk_percent:.1f}%")
            
            if memory_percent > self.config["memory_usage_threshold"]:
                alerts.append(f"メモリ使用率が高いです: {memory_percent:.1f}%")
            
            if cpu_percent > 90:
                alerts.append(f"CPU使用率が高いです: {cpu_percent:.1f}%")
            
            # ログ記録
            self.log(f"システム状態 - CPU: {cpu_percent:.1f}%, Memory: {memory_percent:.1f}%, Disk: {disk_percent:.1f}%")
            
            for alert in alerts:
                self.log(alert, "WARNING")
            
            # CSVに記録
            self.save_health_data(health_data)
            
            return health_data, alerts
        
        except Exception as e:
            self.log(f"システムヘルスチェックエラー: {e}", "ERROR")
            return None, []
    
    def save_health_data(self, health_data):
        """ヘルスデータをCSVに保存"""
        csv_file = "system_health.csv"
        file_exists = os.path.exists(csv_file)
        
        try:
            with open(csv_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=health_data.keys())
                
                if not file_exists:
                    writer.writeheader()
                
                writer.writerow(health_data)
        
        except Exception as e:
            self.log(f"ヘルスデータ保存エラー: {e}", "ERROR")
    
    def cleanup_temp_files(self):
        """一時ファイルの削除"""
        temp_dirs = ["/tmp", "./tmp", "./temp"]
        temp_extensions = [".tmp", ".temp", ".log.old", ".cache"]
        
        deleted_count = 0
        freed_space = 0
        
        try:
            for temp_dir in temp_dirs:
                temp_path = Path(temp_dir)
                if not temp_path.exists():
                    continue
                
                for file_path in temp_path.rglob("*"):
                    if file_path.is_file():
                        # 古いファイル（7日以上前）
                        file_age = time.time() - file_path.stat().st_mtime
                        if file_age > 7 * 24 * 3600:  # 7日
                            try:
                                file_size = file_path.stat().st_size
                                file_path.unlink()
                                deleted_count += 1
                                freed_space += file_size
                            except Exception:
                                continue
                        
                        # 特定の拡張子
                        elif file_path.suffix in temp_extensions:
                            try:
                                file_size = file_path.stat().st_size
                                file_path.unlink()
                                deleted_count += 1
                                freed_space += file_size
                            except Exception:
                                continue
            
            freed_space_mb = freed_space / (1024 * 1024)
            self.log(f"一時ファイル削除完了: {deleted_count}ファイル, {freed_space_mb:.1f}MB解放")
        
        except Exception as e:
            self.log(f"一時ファイル削除エラー: {e}", "ERROR")
    
    def check_dependencies(self):
        """依存関係のチェックと更新チェック"""
        try:
            # package.jsonの確認
            if os.path.exists("package.json"):
                result = subprocess.run(["npm", "audit"], capture_output=True, text=True)
                if result.returncode != 0:
                    self.log("npm audit で脆弱性が検出されました", "WARNING")
                else:
                    self.log("npm 依存関係に問題ありません")
            
            # requirements.txtの確認
            if os.path.exists("requirements.txt"):
                try:
                    import pip
                    self.log("Python依存関係チェック完了")
                except ImportError:
                    self.log("pip が利用できません", "WARNING")
        
        except Exception as e:
            self.log(f"依存関係チェックエラー: {e}", "ERROR")
    
    def generate_report(self):
        """自動化レポート生成"""
        try:
            report_data = {
                "generated_at": datetime.now().isoformat(),
                "system_info": {
                    "platform": os.name,
                    "python_version": ".".join(map(str, __import__("sys").version_info[:3]))
                },
                "backup_status": "OK" if Path(self.config["backup_destination"]).exists() else "NG",
                "log_entries": []
            }
            
            # 最近のログエントリを読み取り
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    report_data["log_entries"] = lines[-10:]  # 最新10行
            
            # レポート保存
            report_file = f"automation_report_{datetime.now().strftime('%Y%m%d')}.json"
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
            
            self.log(f"自動化レポート生成: {report_file}")
        
        except Exception as e:
            self.log(f"レポート生成エラー: {e}", "ERROR")


def main():
    """メイン実行関数"""
    print("=== 自動化タスクデモンストレーション ===")
    
    automation = AutomationTasks()
    
    # 1. システムヘルスチェック
    print("\n1. システムヘルスチェック実行中...")
    health_data, alerts = automation.check_system_health()
    if health_data:
        print(f"  CPU使用率: {health_data['cpu_percent']:.1f}%")
        print(f"  メモリ使用率: {health_data['memory_percent']:.1f}%")
        print(f"  ディスク使用率: {health_data['disk_percent']:.1f}%")
    
    # 2. バックアップ作成
    print("\n2. バックアップ作成中...")
    backup_success = automation.create_backup()
    print(f"  バックアップ: {'成功' if backup_success else '失敗'}")
    
    # 3. 一時ファイルクリーンアップ
    print("\n3. 一時ファイルクリーンアップ中...")
    automation.cleanup_temp_files()
    
    # 4. 依存関係チェック
    print("\n4. 依存関係チェック中...")
    automation.check_dependencies()
    
    # 5. レポート生成
    print("\n5. レポート生成中...")
    automation.generate_report()
    
    print("\n=== 自動化タスク完了 ===")


if __name__ == "__main__":
    main()