import {
    teamSchema,
    playerSchema,
    type Team,
    type Player,
} from "./team.schema";

describe("Team Schema Validation", () => {
    const validPlayer: Player = {
        playerId: "player-001",
        lastName: "山田",
        firstName: "太郎",
        displayName: "山田",
    };

    const validTeam: Team = {
        teamId: "team-001",
        teamName: "テストチーム",
        representativeName: "代表者名",
        representativePhone: "090-1234-5678",
        representativeEmail: "test@example.com",
        players: [validPlayer],
        remarks: "テスト備考",
        isApproved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    describe("Player Schema", () => {
        it("有効な選手データをバリデーションできる", () => {
            const result = playerSchema.safeParse(validPlayer);
            expect(result.success).toBe(true);
        });

        it("必須フィールドが不足している場合はエラーになる", () => {
            const invalidPlayer = { ...validPlayer, lastName: "" };
            const result = playerSchema.safeParse(invalidPlayer);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("姓は必須です");
            }
        });

        it("playerIdが空の場合はエラーになる", () => {
            const invalidPlayer = { ...validPlayer, playerId: "" };
            const result = playerSchema.safeParse(invalidPlayer);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("選手IDは必須です");
            }
        });
    });

    describe("Team Schema", () => {
        it("有効なチームデータをバリデーションできる", () => {
            const result = teamSchema.safeParse(validTeam);
            expect(result.success).toBe(true);
        });

        it("無効なメールアドレスの場合はエラーになる", () => {
            const invalidTeam = {
                ...validTeam,
                representativeEmail: "invalid-email",
            };
            const result = teamSchema.safeParse(invalidTeam);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    "正しいメールアドレスを入力してください"
                );
            }
        });

        it("チーム名が空の場合はエラーになる", () => {
            const invalidTeam = { ...validTeam, teamName: "" };
            const result = teamSchema.safeParse(invalidTeam);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("チーム名は必須です");
            }
        });

        it("選手配列が空でも有効", () => {
            const teamWithoutPlayers = { ...validTeam, players: [] };
            const result = teamSchema.safeParse(teamWithoutPlayers);
            expect(result.success).toBe(true);
        });

        it("isApprovedのデフォルト値はfalse", () => {
            const teamWithoutApproval = { ...validTeam };
            delete (teamWithoutApproval as any).isApproved;
            const result = teamSchema.parse(teamWithoutApproval);
            expect(result.isApproved).toBe(false);
        });
    });
});
