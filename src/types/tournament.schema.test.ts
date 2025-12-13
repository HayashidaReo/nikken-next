import {
  courtSchema,
  tournamentSchema,
  type Court,
  type Tournament,
} from "./tournament.schema";

describe("Tournament Schema Validation", () => {
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
      tournamentId: "tournament-001",
      tournamentName: "全国日本拳法選手権大会",
      tournamentDate: new Date("2024-03-15"),
      tournamentDetail: "テスト用の大会概要",
      location: "東京体育館",
      defaultMatchTime: 180, // 3分
      courts: [
        { courtId: "court-001", courtName: "Aコート" },
        { courtId: "court-002", courtName: "Bコート" },
      ],
      rounds: [
        { roundId: "round-001", roundName: "1回戦" },
        { roundId: "round-002", roundName: "決勝戦" },
      ],
      tournamentType: "individual",
      isTeamFormOpen: true,
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
        // Date型を期待しているので、空文字列はエラー
        expect(result.error.issues[0].code).toBe("invalid_type");
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
        expect(result.error.issues[0].message).toBe(
          "デフォルト試合時間は1秒以上である必要があります"
        );
      }
    });

    it("courtsが空配列の場合はエラー", () => {
      const tournament = { ...validTournament, courts: [] };
      const result = tournamentSchema.safeParse(tournament);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "最低1つのコートを設定してください"
        );
      }
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
      // 異なる日付形式をテスト（Date オブジェクトで）
      const dateStrings = ["2024-03-15", "2024/03/15"];

      dateStrings.forEach(dateStr => {
        const tournament = {
          ...validTournament,
          tournamentDate: new Date(dateStr),
        };
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
      const court: Court = {
        courtId: "court-001",
        courtName: "テストコート",
      };

      const tournament: Tournament = {
        tournamentId: "tournament-001",
        tournamentName: "テスト大会",
        tournamentDate: new Date("2024-01-01"),
        tournamentDetail: "テスト用大会",
        location: "テスト会場",
        defaultMatchTime: 180,
        courts: [court],
        rounds: [
          { roundId: "round-001", roundName: "予選" },
        ],
        tournamentType: "individual",
        isTeamFormOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 型で定義したオブジェクトがスキーマを通ることを確認
      expect(courtSchema.safeParse(court).success).toBe(true);
      expect(tournamentSchema.safeParse(tournament).success).toBe(true);
    });
  });

  describe("エッジケーステスト", () => {
    it("最大文字数制限内の文字列を処理", () => {
      const tournament: Tournament = {
        tournamentId: "tournament-001",
        tournamentName: "あ".repeat(15), // TOURNAMENT_NAME_MAX = 15
        tournamentDate: new Date("2024-01-01"),
        tournamentDetail: "あ".repeat(1000), // TOURNAMENT_DETAIL_MAX = 1000
        location: "あ".repeat(10), // LOCATION_MAX = 10
        defaultMatchTime: 180,
        courts: [{ courtId: "c1", courtName: "Court 1" }],
        rounds: [{ roundId: "r1", roundName: "Round 1" }],
        tournamentType: "individual",
        isTeamFormOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = tournamentSchema.safeParse(tournament);
      expect(result.success).toBe(true);
    });

    it("特殊文字を含む文字列を処理", () => {
      const specialChars = "!@#$%^&*()_";

      const tournament: Tournament = {
        tournamentId: "tournament-001",
        tournamentName: `テスト大会`, // 制限内
        tournamentDate: new Date("2024-01-01"),
        tournamentDetail: `テスト用大会 ${specialChars}`,
        location: `テスト会場`, // 制限内
        defaultMatchTime: 180,
        courts: [{ courtId: "c1", courtName: "Court 1" }],
        rounds: [{ roundId: "r1", roundName: "Round 1" }],
        tournamentType: "individual",
        isTeamFormOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = tournamentSchema.safeParse(tournament);
      expect(result.success).toBe(true);
    });

    it("非常に大きな試合時間を処理", () => {
      const tournament: Tournament = {
        tournamentId: "tournament-001",
        tournamentName: "テスト大会",
        tournamentDate: new Date("2024-01-01"),
        tournamentDetail: "テスト用大会",
        location: "テスト会場",
        defaultMatchTime: 86400, // 24時間
        courts: [{ courtId: "c1", courtName: "Court 1" }],
        rounds: [{ roundId: "r1", roundName: "Round 1" }],
        tournamentType: "individual",
        isTeamFormOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = tournamentSchema.safeParse(tournament);
      expect(result.success).toBe(true);
    });

    it("ISO文字列の日付を自動的にDateに変換", () => {
      // API経由で送られる場合（JSON.stringifyでISO文字列になる）
      const tournamentWithStringDate = {
        tournamentId: "tournament-001",
        tournamentName: "テスト大会",
        tournamentDate: "2024-03-15T00:00:00.000Z", // ISO文字列
        tournamentDetail: "テスト用大会",
        location: "テスト会場",
        defaultMatchTime: 180,
        courts: [{ courtId: "c1", courtName: "Court 1" }],
        rounds: [{ roundId: "r1", roundName: "Round 1" }],
        tournamentType: "individual",
        isTeamFormOpen: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      const result = tournamentSchema.safeParse(tournamentWithStringDate);
      expect(result.success).toBe(true);
      if (result.success) {
        // z.coerce.date()により文字列がDateオブジェクトに変換される
        expect(result.data.tournamentDate).toBeInstanceOf(Date);
        expect(result.data.createdAt).toBeInstanceOf(Date);
        expect(result.data.updatedAt).toBeInstanceOf(Date);
      }
    });
  });
});
