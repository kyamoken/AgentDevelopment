/**
 * ユーティリティ関数集
 * 日常的な開発タスクを自動化する関数群
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * ファイル操作ユーティリティ
 */
class FileUtils {
    /**
     * ディレクトリ内のファイル一覧を取得
     * @param {string} dirPath - ディレクトリパス
     * @param {string} extension - 拡張子フィルター（オプション）
     * @returns {Promise<string[]>} ファイルパスの配列
     */
    static async getFiles(dirPath, extension = null) {
        try {
            const files = await fs.readdir(dirPath);
            let filteredFiles = files;

            if (extension) {
                filteredFiles = files.filter(file => 
                    path.extname(file).toLowerCase() === extension.toLowerCase()
                );
            }

            return filteredFiles.map(file => path.join(dirPath, file));
        } catch (error) {
            console.error(`ディレクトリ読み取りエラー: ${error.message}`);
            return [];
        }
    }

    /**
     * ファイルの統計情報を取得
     * @param {string} filePath - ファイルパス
     * @returns {Promise<object>} ファイル統計情報
     */
    static async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const content = await fs.readFile(filePath, 'utf8');
            
            return {
                path: filePath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                lines: content.split('\n').length,
                characters: content.length,
                extension: path.extname(filePath)
            };
        } catch (error) {
            console.error(`ファイル統計取得エラー: ${error.message}`);
            return null;
        }
    }

    /**
     * バックアップファイルを作成
     * @param {string} filePath - 元ファイルパス
     * @returns {Promise<string>} バックアップファイルパス
     */
    static async createBackup(filePath) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${filePath}.backup.${timestamp}`;
            
            await fs.copyFile(filePath, backupPath);
            console.log(`バックアップ作成: ${backupPath}`);
            return backupPath;
        } catch (error) {
            console.error(`バックアップ作成エラー: ${error.message}`);
            throw error;
        }
    }
}

/**
 * データ処理ユーティリティ
 */
class DataUtils {
    /**
     * CSV データをパース
     * @param {string} csvText - CSV文字列
     * @param {string} delimiter - 区切り文字（デフォルト: カンマ）
     * @returns {object[]} パースされたデータ配列
     */
    static parseCSV(csvText, delimiter = ',') {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(delimiter).map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index]?.trim() || '';
            });
            
            data.push(row);
        }

        return data;
    }

    /**
     * データを CSV 形式に変換
     * @param {object[]} data - データ配列
     * @param {string} delimiter - 区切り文字
     * @returns {string} CSV文字列
     */
    static toCSV(data, delimiter = ',') {
        if (!data || data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(delimiter)];

        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // カンマや改行が含まれる場合はクォートで囲む
                return typeof value === 'string' && (value.includes(delimiter) || value.includes('\n'))
                    ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(delimiter));
        });

        return csvRows.join('\n');
    }

    /**
     * 配列の統計情報を計算
     * @param {number[]} numbers - 数値配列
     * @returns {object} 統計情報
     */
    static calculateStats(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return { error: '有効な数値配列を指定してください' };
        }

        const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n));
        
        if (validNumbers.length === 0) {
            return { error: '有効な数値が見つかりません' };
        }

        const sorted = [...validNumbers].sort((a, b) => a - b);
        const sum = validNumbers.reduce((acc, val) => acc + val, 0);
        const mean = sum / validNumbers.length;
        
        return {
            count: validNumbers.length,
            sum,
            mean,
            median: sorted[Math.floor(sorted.length / 2)],
            min: Math.min(...validNumbers),
            max: Math.max(...validNumbers),
            range: Math.max(...validNumbers) - Math.min(...validNumbers)
        };
    }
}

/**
 * 文字列操作ユーティリティ
 */
class StringUtils {
    /**
     * 文字列をキャメルケースに変換
     * @param {string} str - 変換する文字列
     * @returns {string} キャメルケース文字列
     */
    static toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }

    /**
     * 文字列をスネークケースに変換
     * @param {string} str - 変換する文字列
     * @returns {string} スネークケース文字列
     */
    static toSnakeCase(str) {
        return str
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    }

    /**
     * テキストの可読性スコアを計算（簡易版）
     * @param {string} text - 分析するテキスト
     * @returns {object} 可読性情報
     */
    static analyzeReadability(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.trim().length > 0);
        const characters = text.replace(/\s/g, '').length;

        const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
        const avgCharsPerWord = words.length > 0 ? characters / words.length : 0;

        return {
            sentences: sentences.length,
            words: words.length,
            characters: characters,
            avgWordsPerSentence: parseFloat(avgWordsPerSentence.toFixed(2)),
            avgCharsPerWord: parseFloat(avgCharsPerWord.toFixed(2))
        };
    }
}

/**
 * 日付・時間ユーティリティ
 */
class DateUtils {
    /**
     * 日付を指定フォーマットで文字列に変換
     * @param {Date} date - 変換する日付
     * @param {string} format - フォーマット文字列
     * @returns {string} フォーマット済み日付文字列
     */
    static formatDate(date = new Date(), format = 'YYYY-MM-DD') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    /**
     * 2つの日付間の日数を計算
     * @param {Date} date1 - 開始日
     * @param {Date} date2 - 終了日
     * @returns {number} 日数
     */
    static daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date2 - date1) / oneDay));
    }
}

/**
 * デモ実行関数
 */
async function demonstrateUtils() {
    console.log('=== JavaScript ユーティリティデモンストレーション ===\n');

    // ファイル操作デモ
    console.log('1. ファイル操作デモ');
    try {
        const files = await FileUtils.getFiles('.', '.js');
        console.log('JavaScriptファイル:', files.slice(0, 3));
    } catch (error) {
        console.log('ファイル操作デモをスキップしました');
    }

    // データ処理デモ
    console.log('\n2. データ処理デモ');
    const sampleData = [
        { name: '田中', age: 30, score: 85 },
        { name: '佐藤', age: 25, score: 92 },
        { name: '鈴木', age: 35, score: 78 }
    ];
    
    const csvData = DataUtils.toCSV(sampleData);
    console.log('CSV変換結果:');
    console.log(csvData);

    const scores = sampleData.map(d => d.score);
    const stats = DataUtils.calculateStats(scores);
    console.log('スコア統計:', stats);

    // 文字列操作デモ
    console.log('\n3. 文字列操作デモ');
    const text = 'Hello World Example';
    console.log('元の文字列:', text);
    console.log('キャメルケース:', StringUtils.toCamelCase(text));
    console.log('スネークケース:', StringUtils.toSnakeCase(text));

    const longText = 'これは日本語のサンプルテキストです。複数の文があります。可読性を分析してみましょう。';
    const readability = StringUtils.analyzeReadability(longText);
    console.log('可読性分析:', readability);

    // 日付操作デモ
    console.log('\n4. 日付操作デモ');
    const now = new Date();
    console.log('現在の日時:', DateUtils.formatDate(now, 'YYYY-MM-DD HH:mm:ss'));
    
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    console.log('7日後までの日数:', DateUtils.daysBetween(now, futureDate));

    console.log('\n=== デモンストレーション完了 ===');
}

// モジュール as exports
module.exports = {
    FileUtils,
    DataUtils,
    StringUtils,
    DateUtils,
    demonstrateUtils
};

// 直接実行時のデモ
if (require.main === module) {
    demonstrateUtils().catch(console.error);
}