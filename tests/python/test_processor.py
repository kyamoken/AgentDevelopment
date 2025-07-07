"""
Python コードのテスト例
pytest を使用したユニットテスト
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# テスト対象のモジュールをインポート
sys.path.append(str(Path(__file__).parent.parent / "python" / "data_processing"))
from processor import DataProcessor


class TestDataProcessor:
    """DataProcessorクラスのテスト"""
    
    def setup_method(self):
        """各テスト前の準備"""
        self.processor = DataProcessor()
    
    def test_generate_sample_data(self):
        """サンプルデータ生成のテスト"""
        # 1000件のデータを生成
        data = self.processor.generate_sample_data(1000)
        
        # 基本的な検証
        assert isinstance(data, pd.DataFrame)
        assert len(data) == 1000
        assert list(data.columns) == ['id', 'age', 'salary', 'department', 'years_experience', 'satisfaction']
        
        # データ型の検証
        assert data['id'].dtype == 'int64'
        assert data['age'].dtype == 'int64'
        assert data['salary'].dtype == 'float64'
        assert data['department'].dtype == 'object'
        assert data['years_experience'].dtype == 'float64'
        assert data['satisfaction'].dtype == 'float64'
        
        # 範囲の検証
        assert data['age'].min() >= 20
        assert data['age'].max() <= 65
        assert data['years_experience'].min() >= 0
        assert data['years_experience'].max() <= 40
        assert data['satisfaction'].min() >= 1
        assert data['satisfaction'].max() <= 10
    
    def test_basic_analysis(self):
        """基本分析のテスト"""
        # サンプルデータを生成
        self.processor.generate_sample_data(100)
        
        # 分析実行
        analysis = self.processor.basic_analysis()
        
        # 構造の検証
        assert 'データ概要' in analysis
        assert '基本統計' in analysis
        assert '欠損値' in analysis
        assert 'データ型' in analysis
        
        # データ概要の検証
        assert analysis['データ概要']['行数'] == 100
        assert analysis['データ概要']['列数'] == 6
        
        # 欠損値チェック（生成データなので0であるべき）
        for col, missing_count in analysis['欠損値'].items():
            assert missing_count == 0
    
    def test_empty_data_analysis(self):
        """空データでの分析テスト"""
        # データが設定されていない状態でテスト
        analysis = self.processor.basic_analysis()
        
        # エラーハンドリングの確認
        assert 'error' in analysis
        assert 'データが読み込まれていません' in analysis['error']
    
    def test_small_dataset(self):
        """小さなデータセットのテスト"""
        # 10件の小さなデータセット
        data = self.processor.generate_sample_data(10)
        
        assert len(data) == 10
        
        # 基本分析
        analysis = self.processor.basic_analysis()
        assert analysis['データ概要']['行数'] == 10
    
    def test_department_values(self):
        """部署データの値チェック"""
        data = self.processor.generate_sample_data(1000)
        
        # 部署の値が期待される値に含まれているかチェック
        expected_departments = {'IT', 'Sales', 'Marketing', 'HR'}
        actual_departments = set(data['department'].unique())
        
        assert actual_departments.issubset(expected_departments)
    
    @pytest.mark.parametrize("sample_size", [50, 100, 500, 1000])
    def test_different_sample_sizes(self, sample_size):
        """異なるサンプルサイズでのテスト"""
        data = self.processor.generate_sample_data(sample_size)
        
        assert len(data) == sample_size
        assert data['id'].nunique() == sample_size  # IDがユニークであることを確認


class TestDataProcessorIntegration:
    """統合テスト"""
    
    def test_full_workflow(self):
        """完全なワークフローのテスト"""
        processor = DataProcessor()
        
        # 1. データ生成
        data = processor.generate_sample_data(100)
        assert data is not None
        
        # 2. 基本分析
        analysis = processor.basic_analysis()
        assert 'error' not in analysis
        
        # 3. 分析結果の妥当性チェック
        assert analysis['データ概要']['行数'] == 100
        assert len(analysis['基本統計']) > 0
    
    def test_reproducibility(self):
        """再現性のテスト"""
        # 同じシードを使って同じ結果が得られることを確認
        processor1 = DataProcessor()
        processor2 = DataProcessor()
        
        data1 = processor1.generate_sample_data(100)
        data2 = processor2.generate_sample_data(100)
        
        # 同じシード値を使用しているので、同じデータが生成されるはず
        pd.testing.assert_frame_equal(data1, data2)


# フィクスチャの例
@pytest.fixture
def sample_processor():
    """テスト用のDataProcessorインスタンスを提供"""
    processor = DataProcessor()
    processor.generate_sample_data(50)
    return processor


def test_with_fixture(sample_processor):
    """フィクスチャを使用したテスト例"""
    analysis = sample_processor.basic_analysis()
    assert analysis['データ概要']['行数'] == 50


# パフォーマンステスト
@pytest.mark.slow
def test_large_dataset_performance():
    """大きなデータセットのパフォーマンステスト"""
    import time
    
    processor = DataProcessor()
    
    start_time = time.time()
    data = processor.generate_sample_data(10000)
    generation_time = time.time() - start_time
    
    start_time = time.time()
    analysis = processor.basic_analysis()
    analysis_time = time.time() - start_time
    
    # パフォーマンス要件（例：5秒以内）
    assert generation_time < 5.0, f"データ生成が遅すぎます: {generation_time:.2f}秒"
    assert analysis_time < 2.0, f"分析が遅すぎます: {analysis_time:.2f}秒"


if __name__ == "__main__":
    # テスト実行
    pytest.main([__file__, "-v"])