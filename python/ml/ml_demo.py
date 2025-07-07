"""
機械学習デモンストレーション
シンプルな分類・回帰モデルの実装例
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import json


class MLDemo:
    """機械学習デモンストレーションクラス"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.results = {}
    
    def create_classification_dataset(self, n_samples=1000):
        """分類用サンプルデータセットを作成"""
        np.random.seed(42)
        
        # 特徴量生成
        age = np.random.normal(35, 10, n_samples)
        income = np.random.normal(50000, 20000, n_samples)
        experience = np.random.normal(8, 5, n_samples)
        education = np.random.choice(['高校', '大学', '大学院'], n_samples, p=[0.3, 0.6, 0.1])
        
        # ターゲット変数（昇進の可能性）を作成
        # 年齢、収入、経験、教育レベルに基づく
        education_score = {'高校': 1, '大学': 2, '大学院': 3}
        promotion_score = (
            age * 0.01 + 
            income * 0.00002 + 
            experience * 0.1 + 
            [education_score[edu] for edu in education] +
            np.random.normal(0, 0.5, n_samples)
        )
        
        # 二値分類に変換
        promotion = (promotion_score > np.median(promotion_score)).astype(int)
        
        data = pd.DataFrame({
            'age': age.clip(22, 65),
            'income': income.clip(20000, 150000),
            'experience': experience.clip(0, 40),
            'education': education,
            'promotion': promotion
        })
        
        return data
    
    def create_regression_dataset(self, n_samples=1000):
        """回帰用サンプルデータセットを作成"""
        np.random.seed(42)
        
        # 特徴量生成
        size = np.random.normal(100, 30, n_samples)  # 面積（平方メートル）
        rooms = np.random.poisson(3, n_samples) + 1  # 部屋数
        age = np.random.exponential(10, n_samples)   # 築年数
        location = np.random.choice(['都心', '郊外', '地方'], n_samples, p=[0.3, 0.5, 0.2])
        
        # 価格を計算（目的変数）
        location_multiplier = {'都心': 1.5, '郊外': 1.0, '地方': 0.7}
        price = (
            size * 500 +  # 面積による基本価格
            rooms * 50000 +  # 部屋数ボーナス
            -age * 2000 +  # 築年数による減額
            [location_multiplier[loc] * 1000000 for loc in location] +
            np.random.normal(0, 100000, n_samples)  # ノイズ
        )
        
        data = pd.DataFrame({
            'size': size.clip(30, 200),
            'rooms': rooms.clip(1, 8),
            'age': age.clip(0, 50),
            'location': location,
            'price': price.clip(500000, 5000000)
        })
        
        return data
    
    def train_classification_model(self, data):
        """分類モデルの訓練"""
        print("=== 分類モデル訓練 ===")
        
        # データ前処理
        X = data[['age', 'income', 'experience', 'education']].copy()
        y = data['promotion']
        
        # カテゴリカル変数のエンコーディング
        le = LabelEncoder()
        X['education_encoded'] = le.fit_transform(X['education'])
        X = X.drop('education', axis=1)
        self.encoders['education'] = le
        
        # 標準化
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        self.scalers['classification'] = scaler
        
        # 訓練・テストデータ分割
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # モデル訓練
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        self.models['classification'] = model
        
        # 予測と評価
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # 結果保存
        self.results['classification'] = {
            'accuracy': accuracy,
            'classification_report': classification_report(y_test, y_pred, output_dict=True),
            'feature_importance': dict(zip(X.columns, model.feature_importances_))
        }
        
        print(f"分類精度: {accuracy:.3f}")
        print("特徴量重要度:")
        for feature, importance in self.results['classification']['feature_importance'].items():
            print(f"  {feature}: {importance:.3f}")
        
        return model, X_test, y_test, y_pred
    
    def train_regression_model(self, data):
        """回帰モデルの訓練"""
        print("\n=== 回帰モデル訓練 ===")
        
        # データ前処理
        X = data[['size', 'rooms', 'age', 'location']].copy()
        y = data['price']
        
        # カテゴリカル変数のエンコーディング
        le = LabelEncoder()
        X['location_encoded'] = le.fit_transform(X['location'])
        X = X.drop('location', axis=1)
        self.encoders['location'] = le
        
        # 標準化
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        self.scalers['regression'] = scaler
        
        # 訓練・テストデータ分割
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # モデル訓練
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        self.models['regression'] = model
        
        # 予測と評価
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # 結果保存
        self.results['regression'] = {
            'mse': mse,
            'rmse': np.sqrt(mse),
            'r2_score': r2,
            'feature_importance': dict(zip(X.columns, model.feature_importances_))
        }
        
        print(f"R² スコア: {r2:.3f}")
        print(f"RMSE: {np.sqrt(mse):,.0f}")
        print("特徴量重要度:")
        for feature, importance in self.results['regression']['feature_importance'].items():
            print(f"  {feature}: {importance:.3f}")
        
        return model, X_test, y_test, y_pred
    
    def create_visualizations(self, output_dir="output"):
        """結果の可視化"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        # 分類結果の可視化
        if 'classification' in self.results:
            plt.figure(figsize=(10, 6))
            
            # 特徴量重要度
            plt.subplot(1, 2, 1)
            features = list(self.results['classification']['feature_importance'].keys())
            importances = list(self.results['classification']['feature_importance'].values())
            
            plt.barh(features, importances)
            plt.title('分類モデル - 特徴量重要度')
            plt.xlabel('重要度')
            
            # 分類レポートの可視化
            plt.subplot(1, 2, 2)
            report = self.results['classification']['classification_report']
            metrics = ['precision', 'recall', 'f1-score']
            class_0 = [report['0'][metric] for metric in metrics]
            class_1 = [report['1'][metric] for metric in metrics]
            
            x = np.arange(len(metrics))
            width = 0.35
            
            plt.bar(x - width/2, class_0, width, label='昇進なし')
            plt.bar(x + width/2, class_1, width, label='昇進あり')
            plt.xlabel('評価指標')
            plt.ylabel('スコア')
            plt.title('分類性能')
            plt.xticks(x, metrics)
            plt.legend()
            
            plt.tight_layout()
            plt.savefig(f"{output_dir}/classification_results.png", dpi=300, bbox_inches='tight')
            plt.close()
        
        # 回帰結果の可視化
        if 'regression' in self.results:
            plt.figure(figsize=(10, 6))
            
            # 特徴量重要度
            plt.subplot(1, 2, 1)
            features = list(self.results['regression']['feature_importance'].keys())
            importances = list(self.results['regression']['feature_importance'].values())
            
            plt.barh(features, importances)
            plt.title('回帰モデル - 特徴量重要度')
            plt.xlabel('重要度')
            
            # 評価指標
            plt.subplot(1, 2, 2)
            metrics = ['R² Score', 'RMSE (万円)']
            values = [
                self.results['regression']['r2_score'],
                self.results['regression']['rmse'] / 10000  # 万円単位
            ]
            
            colors = ['skyblue', 'lightcoral']
            plt.bar(metrics, values, color=colors)
            plt.title('回帰性能')
            plt.ylabel('値')
            
            for i, v in enumerate(values):
                plt.text(i, v + 0.01, f'{v:.2f}', ha='center', va='bottom')
            
            plt.tight_layout()
            plt.savefig(f"{output_dir}/regression_results.png", dpi=300, bbox_inches='tight')
            plt.close()
        
        print(f"グラフを {output_dir} に保存しました")
    
    def save_results(self, filename="ml_results.json"):
        """結果をJSONファイルに保存"""
        # NumPy配列をリストに変換
        serializable_results = {}
        for model_type, results in self.results.items():
            serializable_results[model_type] = {}
            for key, value in results.items():
                if isinstance(value, np.ndarray):
                    serializable_results[model_type][key] = value.tolist()
                elif isinstance(value, np.integer):
                    serializable_results[model_type][key] = int(value)
                elif isinstance(value, np.floating):
                    serializable_results[model_type][key] = float(value)
                else:
                    serializable_results[model_type][key] = value
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(serializable_results, f, ensure_ascii=False, indent=2)
        
        print(f"結果を {filename} に保存しました")


def main():
    """メイン実行関数"""
    print("=== 機械学習デモンストレーション ===")
    
    # MLデモインスタンス作成
    ml_demo = MLDemo()
    
    # 分類データセット作成・訓練
    print("\n1. 分類問題（昇進予測）")
    classification_data = ml_demo.create_classification_dataset(1000)
    print(f"分類データセット作成完了: {classification_data.shape}")
    print(f"昇進率: {classification_data['promotion'].mean():.1%}")
    
    ml_demo.train_classification_model(classification_data)
    
    # 回帰データセット作成・訓練
    print("\n2. 回帰問題（不動産価格予測）")
    regression_data = ml_demo.create_regression_dataset(1000)
    print(f"回帰データセット作成完了: {regression_data.shape}")
    print(f"平均価格: {regression_data['price'].mean():,.0f}円")
    
    ml_demo.train_regression_model(regression_data)
    
    # 可視化と結果保存
    print("\n3. 結果の可視化と保存")
    ml_demo.create_visualizations()
    ml_demo.save_results()
    
    print("\n=== 機械学習デモ完了 ===")


if __name__ == "__main__":
    main()