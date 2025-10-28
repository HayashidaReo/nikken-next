import {
    organizationSchema,
    courtSchema,
    tournamentSchema,
    type Organization,
    type Court,
    type Tournament,
} from "./tournament.schema";

describe("Tournament Schema Validation", () => {
    describe("organizationSchema", () => {
        const validOrganization: Organization = {
            orgId: "org-001",
            orgName: "日本拳法連盟",
            representativeName: "田中太郎",
            representativePhone: "090-1234-5678",
            representativeEmail: "tanaka@example.com",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("有効な組織データを受け入れる", () => {
            const result = organizationSchema.safeParse(validOrganization);
            expect(result.success).toBe(true);
        });

        it("orgIdが空文字列の場合はエラー", () => {
            const invalid = { ...validOrganization, orgId: "" };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("組織IDは必須です");
            }
        });

        it("orgNameが空文字列の場合はエラー", () => {
            const invalid = { ...validOrganization, orgName: "" };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("団体名は必須です");
            }
        });

        it("representativeNameが空文字列の場合はエラー", () => {
            const invalid = { ...validOrganization, representativeName: "" };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("代表者名は必須です");
            }
        });

        it("representativePhoneが空文字列の場合はエラー", () => {
            const invalid = { ...validOrganization, representativePhone: "" };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("電話番号は必須です");
            }
        });

        it("representativeEmailが無効な形式の場合はエラー", () => {
            const invalid = { ...validOrganization, representativeEmail: "invalid-email" };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("正しいメールアドレスを入力してください");
            }
        });

        it("必須プロパティが不足している場合はエラー", () => {
            const invalid = {
                orgName: "テスト団体",
            };
            const result = organizationSchema.safeParse(invalid);

            expect(result.success).toBe(false);
        });
    });

    describe("courtSchema", () => {
        const validCourt: Court = {
            courtId: "court-001",
            courtName: "Aコート",
        };

        it("有効なコートデータを受け入れる", () => {
            const result = courtSchema.safeParse(validCourt);
            expect(result.success).toBe(true);
        });

        it("courtIdが空文字列の場合はエラー", () => {
            const invalid = { ...validCourt, courtId: "" };
            const result = courtSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("コートIDは必須です");
            }
        });

        it("courtNameが空文字列の場合はエラー", () => {
            const invalid = { ...validCourt, courtName: "" };
            const result = courtSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("コート名は必須です");
            }
        });
    });

    describe("tournamentSchema", () => {
        const validTournament: Tournament = {
            tournamentName: "全国日本拳法選手権大会",
            tournamentDate: "2024-03-15",
            location: "東京体育館",
            defaultMatchTime: 180, // 3分
            courts: [
                { courtId: "court-001", courtName: "Aコート" },
                { courtId: "court-002", courtName: "Bコート" },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it("有効な大会データを受け入れる", () => {
            const result = tournamentSchema.safeParse(validTournament);
            expect(result.success).toBe(true);
        });

        it("tournamentNameが空文字列の場合はエラー", () => {
            const invalid = { ...validTournament, tournamentName: "" };
            const result = tournamentSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("大会名は必須です");
            }
        });

        it("tournamentDateが空文字列の場合はエラー", () => {
            const invalid = { ...validTournament, tournamentDate: "" };
            const result = tournamentSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("開催日は必須です");
            }
        });

        it("locationが空文字列の場合はエラー", () => {
            const invalid = { ...validTournament, location: "" };
            const result = tournamentSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("開催場所は必須です");
            }
        });

        it("defaultMatchTimeが0以下の場合はエラー", () => {
            const invalid = { ...validTournament, defaultMatchTime: 0 };
            const result = tournamentSchema.safeParse(invalid);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("デフォルト試合時間は必須です");
            }
        });

        it("courtsが空配列でも受け入れる", () => {
            const tournament = { ...validTournament, courts: [] };
            const result = tournamentSchema.safeParse(tournament);
            expect(result.success).toBe(true);
        });

        it("courts内の無効なコートデータでエラー", () => {
            const tournament = {
                ...validTournament,
                courts: [
                    { courtId: "", courtName: "Aコート" }, // 無効なコートID
                ],
            };
            const result = tournamentSchema.safeParse(tournament);

            expect(result.success).toBe(false);
        });

        it("複数のコートデータを正しく検証", () => {
            const tournament = {
                ...validTournament,
                courts: [
                    { courtId: "court-001", courtName: "Aコート" },
                    { courtId: "court-002", courtName: "Bコート" },
                    { courtId: "court-003", courtName: "Cコート" },
                ],
            };
            const result = tournamentSchema.safeParse(tournament);
            expect(result.success).toBe(true);
        });

        it("日付の形式をテスト", () => {
            // 異なる日付形式をテスト
            const dateFormats = ["2024-03-15", "2024/03/15", "令和6年3月15日"];

            dateFormats.forEach(date => {
                const tournament = { ...validTournament, tournamentDate: date };
                const result = tournamentSchema.safeParse(tournament);
                expect(result.success).toBe(true);
            });
        });

        it("デフォルト試合時間の妥当性をテスト", () => {
            // 一般的な試合時間
            const validTimes = [60, 120, 180, 300]; // 1分、2分、3分、5分

            validTimes.forEach(time => {
                const tournament = { ...validTournament, defaultMatchTime: time };
                const result = tournamentSchema.safeParse(tournament);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.defaultMatchTime).toBe(time);
                }
            });
        });
    });

    describe("型の相互変換テスト", () => {
        it("TypeScriptの型とZodスキーマの一貫性", () => {
            const org: Organization = {
                orgId: "test-001",
                orgName: "テスト団体",
                representativeName: "テスト太郎",
                representativePhone: "090-0000-0000",
                representativeEmail: "test@example.com",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const court: Court = {
                courtId: "court-001",
                courtName: "テストコート",
            };

            const tournament: Tournament = {
                tournamentName: "テスト大会",
                tournamentDate: "2024-01-01",
                location: "テスト会場",
                defaultMatchTime: 180,
                courts: [court],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // 型で定義したオブジェクトがスキーマを通ることを確認
            expect(organizationSchema.safeParse(org).success).toBe(true);
            expect(courtSchema.safeParse(court).success).toBe(true);
            expect(tournamentSchema.safeParse(tournament).success).toBe(true);
        });
    });

    describe("エッジケーステスト", () => {
        it("非常に長い文字列を処理", () => {
            const longString = "あ".repeat(1000);

            const tournament: Tournament = {
                tournamentName: longString,
                tournamentDate: "2024-01-01",
                location: longString,
                defaultMatchTime: 180,
                courts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = tournamentSchema.safeParse(tournament);
            expect(result.success).toBe(true);
        });

        it("特殊文字を含む文字列を処理", () => {
            const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

            const tournament: Tournament = {
                tournamentName: `テスト大会 ${specialChars}`,
                tournamentDate: "2024-01-01",
                location: `テスト会場 ${specialChars}`,
                defaultMatchTime: 180,
                courts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = tournamentSchema.safeParse(tournament);
            expect(result.success).toBe(true);
        });

        it("非常に大きな試合時間を処理", () => {
            const tournament: Tournament = {
                tournamentName: "テスト大会",
                tournamentDate: "2024-01-01",
                location: "テスト会場",
                defaultMatchTime: 86400, // 24時間
                courts: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = tournamentSchema.safeParse(tournament);
            expect(result.success).toBe(true);
        });
    });
});