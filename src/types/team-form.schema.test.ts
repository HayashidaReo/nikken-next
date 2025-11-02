import { teamFormSchema } from './team-form.schema';

describe('team-form.schema', () => {
    describe('teamFormSchema', () => {
        const validData = {
            teamName: '東京拳法クラブ',
            representativeName: '田中 太郎',
            representativePhone: '090-1234-5678',
            representativeEmail: 'tanaka@example.com',
            players: [
                { fullName: '山田 太郎' },
                { fullName: '佐藤 花子' },
            ],
            remarks: '特記事項なし',
        };

        test('有効なデータでバリデーションが通る', () => {
            const result = teamFormSchema.safeParse(validData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.teamName).toBe(validData.teamName);
                expect(result.data.players).toHaveLength(2);
            }
        }); test('チーム名が空の場合エラーになる', () => {
            const invalidData = { ...validData, teamName: '' };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('teamName') && issue.message.includes('必須')
                )).toBe(true);
            }
        });

        test('代表者名が空の場合エラーになる', () => {
            const invalidData = { ...validData, representativeName: '' };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('representativeName')
                )).toBe(true);
            }
        });

        test('無効なメールアドレスでエラーになる', () => {
            const invalidData = { ...validData, representativeEmail: 'invalid-email' };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('representativeEmail') && issue.message.includes('メールアドレス')
                )).toBe(true);
            }
        });

        test('電話番号が空の場合エラーになる', () => {
            const invalidData = { ...validData, representativePhone: '' };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('representativePhone')
                )).toBe(true);
            }
        });

        test('選手が0人の場合エラーになる', () => {
            const invalidData = { ...validData, players: [] };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('players') && issue.message.includes('最低1人')
                )).toBe(true);
            }
        });

        test('選手名が空の場合エラーになる', () => {
            const invalidData = {
                ...validData,
                players: [
                    { fullName: '山田 太郎' },
                    { fullName: '' },
                ],
            };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('fullName') && issue.message.includes('必須')
                )).toBe(true);
            }
        });

        test('選手名が不正な形式の場合エラーになる', () => {
            const invalidData = {
                ...validData,
                players: [
                    { fullName: '山田 太郎' },
                    { fullName: '単一名' }, // 姓名分割できない
                ],
            };
            const result = teamFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('姓 名') && issue.message.includes('形式')
                )).toBe(true);
            }
        });

        test('remarksは空でも有効', () => {
            const dataWithoutRemarks = { ...validData, remarks: '' };
            const result = teamFormSchema.safeParse(dataWithoutRemarks);
            expect(result.success).toBe(true);
        });
    });
});