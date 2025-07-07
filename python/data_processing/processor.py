"""
データ処理デモンストレーション
CSVファイルの読み込み、分析、可視化を行う例
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json


class DataProcessor:
    """データ処理クラス"""
    
    def __init__(self, data_path: str = None):
        self.data_path = data_path
        self.data = None
        
    def load_csv(self, file_path: str) -> pd.DataFrame:
        """CSVファイルを読み込む"""
        try:
            self.data = pd.read_csv(file_path)
            print(f"データを読み込みました: {self.data.shape}")
            return self.data
        except Exception as e:
            print(f"エラー: {e}")
            return None
    
    def generate_sample_data(self, n_samples: int = 1000) -> pd.DataFrame:
        """サンプルデータを生成"""
        np.random.seed(42)
        
        data = {
            'id': range(1, n_samples + 1),
            'age': np.random.normal(35, 10, n_samples).astype(int),
            'salary': np.random.normal(50000, 15000, n_samples),
            'department': np.random.choice(['IT', 'Sales', 'Marketing', 'HR'], n_samples),
            'years_experience': np.random.normal(8, 5, n_samples),
            'satisfaction': np.random.uniform(1, 10, n_samples)
        }
        
        self.data = pd.DataFrame(data)
        # 年齢を20-65の範囲に制限
        self.data['age'] = self.data['age'].clip(20, 65)
        # 経験年数を0-40の範囲に制限
        self.data['years_experience'] = self.data['years_experience'].clip(0, 40)
        
        return self.data
    
    def basic_analysis(self) -> dict:
        """基本的な統計分析"""
        if self.data is None:
            return {"error": "データが読み込まれていません"}
        
        analysis = {
            "データ概要": {
                "行数": len(self.data),
                "列数": len(self.data.columns),
                "列名": list(self.data.columns)
            },
            "基本統計": self.data.describe().to_dict(),
            "欠損値": self.data.isnull().sum().to_dict(),
            "データ型": self.data.dtypes.astype(str).to_dict()
        }
        
        return analysis
    
    def create_visualizations(self, output_dir: str = "output"):
        """データ可視化"""
        if self.data is None:
            print("データが読み込まれていません")
            return
        
        # 出力ディレクトリを作成
        Path(output_dir).mkdir(exist_ok=True)
        
        # スタイル設定
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
        # 1. ヒストグラム
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle('データ分布', fontsize=16)
        
        self.data['age'].hist(bins=20, ax=axes[0,0])
        axes[0,0].set_title('年齢分布')
        axes[0,0].set_xlabel('年齢')
        
        self.data['salary'].hist(bins=20, ax=axes[0,1])
        axes[0,1].set_title('給与分布')
        axes[0,1].set_xlabel('給与')
        
        self.data['years_experience'].hist(bins=20, ax=axes[1,0])
        axes[1,0].set_title('経験年数分布')
        axes[1,0].set_xlabel('経験年数')
        
        self.data['satisfaction'].hist(bins=20, ax=axes[1,1])
        axes[1,1].set_title('満足度分布')
        axes[1,1].set_xlabel('満足度')
        
        plt.tight_layout()
        plt.savefig(f"{output_dir}/distributions.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 2. 部署別分析
        plt.figure(figsize=(10, 6))
        dept_salary = self.data.groupby('department')['salary'].mean().sort_values(ascending=False)
        dept_salary.plot(kind='bar')
        plt.title('部署別平均給与')
        plt.xlabel('部署')
        plt.ylabel('平均給与')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f"{output_dir}/department_salary.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. 相関マトリックス
        numeric_cols = self.data.select_dtypes(include=[np.number]).columns
        correlation_matrix = self.data[numeric_cols].corr()
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
        plt.title('相関マトリックス')
        plt.tight_layout()
        plt.savefig(f"{output_dir}/correlation_matrix.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"グラフを {output_dir} ディレクトリに保存しました")
    
    def export_results(self, analysis: dict, output_path: str = "analysis_results.json"):
        """分析結果をJSONで出力"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, ensure_ascii=False, indent=2)
        print(f"分析結果を {output_path} に保存しました")


def main():
    """メイン実行関数"""
    print("=== データ処理デモンストレーション ===")
    
    # データプロセッサーを初期化
    processor = DataProcessor()
    
    # サンプルデータを生成
    print("\n1. サンプルデータ生成中...")
    data = processor.generate_sample_data(1000)
    print(f"生成されたデータのサイズ: {data.shape}")
    
    # 基本分析
    print("\n2. 基本統計分析実行中...")
    analysis = processor.basic_analysis()
    
    # 結果表示
    print("\n=== 分析結果 ===")
    print(f"データ行数: {analysis['データ概要']['行数']}")
    print(f"データ列数: {analysis['データ概要']['列数']}")
    print("\n年齢の統計:")
    age_stats = analysis['基本統計']['age']
    print(f"  平均: {age_stats['mean']:.1f}歳")
    print(f"  最小: {age_stats['min']:.0f}歳")
    print(f"  最大: {age_stats['max']:.0f}歳")
    
    # 可視化
    print("\n3. データ可視化中...")
    processor.create_visualizations()
    
    # 結果をエクスポート
    print("\n4. 結果をエクスポート中...")
    processor.export_results(analysis)
    
    print("\n=== 処理完了 ===")


if __name__ == "__main__":
    main()