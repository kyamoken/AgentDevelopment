/**
 * JavaScript ユーティリティのテスト
 * Jest を使用したユニットテスト例
 */

const {
    FileUtils,
    DataUtils,
    StringUtils,
    DateUtils
} = require('../../javascript/utils/helpers');

describe('DataUtils', () => {
    describe('parseCSV', () => {
        test('基本的なCSVパースができる', () => {
            const csvText = 'name,age,city\n田中,30,東京\n佐藤,25,大阪';
            const result = DataUtils.parseCSV(csvText);
            
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ name: '田中', age: '30', city: '東京' });
            expect(result[1]).toEqual({ name: '佐藤', age: '25', city: '大阪' });
        });

        test('空のCSVを処理できる', () => {
            const result = DataUtils.parseCSV('');
            expect(result).toEqual([]);
        });

        test('カスタム区切り文字を使用できる', () => {
            const csvText = 'name;age;city\n田中;30;東京';
            const result = DataUtils.parseCSV(csvText, ';');
            
            expect(result[0]).toEqual({ name: '田中', age: '30', city: '東京' });
        });
    });

    describe('toCSV', () => {
        test('オブジェクト配列をCSVに変換できる', () => {
            const data = [
                { name: '田中', age: 30, city: '東京' },
                { name: '佐藤', age: 25, city: '大阪' }
            ];
            
            const result = DataUtils.toCSV(data);
            const expected = 'name,age,city\n田中,30,東京\n佐藤,25,大阪';
            
            expect(result).toBe(expected);
        });

        test('空の配列を処理できる', () => {
            const result = DataUtils.toCSV([]);
            expect(result).toBe('');
        });

        test('特殊文字を含むデータを適切に処理できる', () => {
            const data = [{ name: 'テスト,データ', value: 'test"value' }];
            const result = DataUtils.toCSV(data);
            
            expect(result).toContain('"テスト,データ"');
            expect(result).toContain('"test""value"');
        });
    });

    describe('calculateStats', () => {
        test('基本的な統計を計算できる', () => {
            const numbers = [1, 2, 3, 4, 5];
            const stats = DataUtils.calculateStats(numbers);
            
            expect(stats.count).toBe(5);
            expect(stats.sum).toBe(15);
            expect(stats.mean).toBe(3);
            expect(stats.min).toBe(1);
            expect(stats.max).toBe(5);
            expect(stats.median).toBe(3);
        });

        test('無効な入力を適切に処理する', () => {
            const result = DataUtils.calculateStats([]);
            expect(result.error).toBeDefined();
        });

        test('NaNや非数値を含む配列を処理できる', () => {
            const numbers = [1, 2, NaN, 4, 'invalid', 5];
            const stats = DataUtils.calculateStats(numbers);
            
            expect(stats.count).toBe(4); // 有効な数値のみカウント
            expect(stats.sum).toBe(12);
        });
    });
});

describe('StringUtils', () => {
    describe('toCamelCase', () => {
        test('文字列をキャメルケースに変換できる', () => {
            expect(StringUtils.toCamelCase('hello world')).toBe('helloWorld');
            expect(StringUtils.toCamelCase('test-string')).toBe('testString');
            expect(StringUtils.toCamelCase('UPPER CASE')).toBe('upperCase');
        });

        test('既にキャメルケースの文字列を処理できる', () => {
            expect(StringUtils.toCamelCase('alreadyCamelCase')).toBe('alreadyCamelCase');
        });
    });

    describe('toSnakeCase', () => {
        test('文字列をスネークケースに変換できる', () => {
            expect(StringUtils.toSnakeCase('hello world')).toBe('hello_world');
            expect(StringUtils.toSnakeCase('camelCaseString')).toBe('camel_case_string');
            expect(StringUtils.toSnakeCase('PascalCaseString')).toBe('pascal_case_string');
        });
    });

    describe('analyzeReadability', () => {
        test('テキストの可読性を分析できる', () => {
            const text = 'これはテストです。短い文章です。';
            const result = StringUtils.analyzeReadability(text);
            
            expect(result.sentences).toBe(2);
            expect(result.words).toBeGreaterThan(0);
            expect(result.characters).toBeGreaterThan(0);
            expect(result.avgWordsPerSentence).toBeGreaterThan(0);
            expect(result.avgCharsPerWord).toBeGreaterThan(0);
        });

        test('空のテキストを処理できる', () => {
            const result = StringUtils.analyzeReadability('');
            expect(result.sentences).toBe(0);
            expect(result.words).toBe(0);
            expect(result.characters).toBe(0);
        });
    });
});

describe('DateUtils', () => {
    describe('formatDate', () => {
        test('日付を指定フォーマットで文字列に変換できる', () => {
            const date = new Date('2023-12-25T15:30:45');
            
            expect(DateUtils.formatDate(date, 'YYYY-MM-DD')).toBe('2023-12-25');
            expect(DateUtils.formatDate(date, 'YYYY/MM/DD HH:mm:ss'))
                .toBe('2023/12/25 15:30:45');
        });

        test('デフォルトフォーマットを使用できる', () => {
            const date = new Date('2023-12-25');
            const result = DateUtils.formatDate(date);
            
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('daysBetween', () => {
        test('2つの日付間の日数を計算できる', () => {
            const date1 = new Date('2023-01-01');
            const date2 = new Date('2023-01-08');
            
            expect(DateUtils.daysBetween(date1, date2)).toBe(7);
        });

        test('順序が逆でも正しく計算できる', () => {
            const date1 = new Date('2023-01-08');
            const date2 = new Date('2023-01-01');
            
            expect(DateUtils.daysBetween(date1, date2)).toBe(7);
        });

        test('同じ日付では0を返す', () => {
            const date = new Date('2023-01-01');
            
            expect(DateUtils.daysBetween(date, date)).toBe(0);
        });
    });
});

// 統合テスト
describe('Utils Integration', () => {
    test('CSVデータの完全な処理フロー', () => {
        // 1. データ作成
        const originalData = [
            { name: '田中太郎', score: 85, date: '2023-01-15' },
            { name: '佐藤花子', score: 92, date: '2023-01-16' },
            { name: '鈴木一郎', score: 78, date: '2023-01-17' }
        ];

        // 2. CSV変換
        const csvString = DataUtils.toCSV(originalData);
        expect(csvString).toContain('name,score,date');

        // 3. CSV解析
        const parsedData = DataUtils.parseCSV(csvString);
        expect(parsedData).toHaveLength(3);
        expect(parsedData[0].name).toBe('田中太郎');

        // 4. 統計計算
        const scores = parsedData.map(d => parseInt(d.score));
        const stats = DataUtils.calculateStats(scores);
        expect(stats.count).toBe(3);
        expect(stats.mean).toBeCloseTo(85);
    });

    test('文字列処理とデータ変換の組み合わせ', () => {
        const text = 'user name';
        const camelCase = StringUtils.toCamelCase(text);
        const snakeCase = StringUtils.toSnakeCase(text);

        expect(camelCase).toBe('userName');
        expect(snakeCase).toBe('user_name');

        // データオブジェクトのキー変換シミュレーション
        const data = { [camelCase]: 'test', [snakeCase]: 'value' };
        expect(data.userName).toBe('test');
        expect(data.user_name).toBe('value');
    });
});

// パフォーマンステスト
describe('Performance Tests', () => {
    test('大量データの統計計算', () => {
        const largeArray = Array.from({ length: 100000 }, (_, i) => i);
        
        const startTime = performance.now();
        const stats = DataUtils.calculateStats(largeArray);
        const endTime = performance.now();
        
        expect(stats.count).toBe(100000);
        expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
    });

    test('大きなCSVデータの処理', () => {
        // 1000行のCSVデータを生成
        const headers = 'id,name,value';
        const rows = Array.from({ length: 1000 }, (_, i) => 
            `${i},name${i},${Math.random() * 100}`
        );
        const csvData = headers + '\n' + rows.join('\n');

        const startTime = performance.now();
        const parsed = DataUtils.parseCSV(csvData);
        const endTime = performance.now();

        expect(parsed).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(500); // 500ms以内
    });
});

// エラーハンドリングテスト
describe('Error Handling', () => {
    test('無効な入力に対する適切なエラー処理', () => {
        expect(DataUtils.calculateStats(null)).toHaveProperty('error');
        expect(DataUtils.calculateStats('invalid')).toHaveProperty('error');
        expect(DataUtils.calculateStats({})).toHaveProperty('error');
    });

    test('空文字列や null の処理', () => {
        expect(StringUtils.toCamelCase('')).toBe('');
        expect(StringUtils.toSnakeCase('')).toBe('');
        expect(DataUtils.parseCSV('')).toEqual([]);
        expect(DataUtils.toCSV(null)).toBe('');
    });
});