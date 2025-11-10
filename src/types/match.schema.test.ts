import {
  matchSchema,
  hansokuStateEnum,
  type Match,
  type MatchPlayer,
} from "./match.schema";

describe("Match Schema Validation", () => {
  const validMatchPlayer: MatchPlayer = {
    displayName: "山田",
    playerId: "player-001",
    teamId: "team-001",
    teamName: "テストチーム",
    score: 0,
    hansoku: 0,
  };

  const validMatch: Match = {
    matchId: "match-001",
    courtId: "court-001",
    round: "1回戦",
    players: {
      playerA: validMatchPlayer,
      playerB: {
        ...validMatchPlayer,
        playerId: "player-002",
        displayName: "鈴木",
      },
    },
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("Hansoku State Enum", () => {
    it("有効な反則状態をバリデーションできる", () => {
      const validStates = ["none", "yellow", "red", "red_yellow", "red_red"];
      validStates.forEach(state => {
        const result = hansokuStateEnum.safeParse(state);
        expect(result.success).toBe(true);
      });
    });

    it("無効な反則状態はエラーになる", () => {
      const result = hansokuStateEnum.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("MatchPlayer Schema", () => {
    it("有効な選手データをバリデーションできる", () => {
      const result =
        matchSchema.shape.players.shape.playerA.safeParse(validMatchPlayer);
      expect(result.success).toBe(true);
    });

    it("得点が2を超える場合はエラーになる", () => {
      const invalidPlayer = { ...validMatchPlayer, score: 3 };
      const result =
        matchSchema.shape.players.shape.playerA.safeParse(invalidPlayer);
      expect(result.success).toBe(false);
    });

    it("得点が負数の場合はエラーになる", () => {
      const invalidPlayer = { ...validMatchPlayer, score: -1 };
      const result =
        matchSchema.shape.players.shape.playerA.safeParse(invalidPlayer);
      expect(result.success).toBe(false);
    });

    it("反則状態が4を超える場合はエラーになる", () => {
      const invalidPlayer = { ...validMatchPlayer, hansoku: 5 };
      const result =
        matchSchema.shape.players.shape.playerA.safeParse(invalidPlayer);
      expect(result.success).toBe(false);
    });
  });

  describe("Match Schema", () => {
    it("有効な試合データをバリデーションできる", () => {
      const result = matchSchema.safeParse(validMatch);
      expect(result.success).toBe(true);
    });

    it("試合IDが空文字列の場合でも有効（optionalのため）", () => {
      const matchWithEmptyId = { ...validMatch, matchId: "" };
      const result = matchSchema.safeParse(matchWithEmptyId);
      expect(result.success).toBe(true);
    });

    it("コートIDが空の場合はエラーになる", () => {
      const invalidMatch = { ...validMatch, courtId: "" };
      const result = matchSchema.safeParse(invalidMatch);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("コートIDは必須です");
      }
    });

    it("ラウンドが空の場合はエラーになる", () => {
      const invalidMatch = { ...validMatch, round: "" };
      const result = matchSchema.safeParse(invalidMatch);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("ラウンドは必須です");
      }
    });
  });
});
