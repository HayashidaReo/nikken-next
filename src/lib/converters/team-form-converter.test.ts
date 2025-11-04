import { TeamFormConverter } from "./team-form-converter";
import type { TeamFormData } from "@/types/team-form.schema";

// uuid のモック
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid-123"),
}));

// DisplayNameService のモック
jest.mock("@/domains/team/services/display-name.service", () => ({
  DisplayNameService: {
    generateDisplayNames: jest.fn(
      (players: Array<{ lastName: string; firstName: string }>) =>
        players.map(p => ({
          ...p,
          displayName: `${p.lastName} ${p.firstName[0]}`,
        }))
    ),
  },
}));

describe("TeamFormConverter", () => {
  const validFormData: TeamFormData = {
    teamName: "東京拳法クラブ",
    representativeName: "田中 太郎",
    representativePhone: "090-1234-5678",
    representativeEmail: "tanaka@example.com",
    players: [{ fullName: "山田 太郎" }, { fullName: "佐藤 花子" }],
    remarks: "特記事項なし",
  };

  describe("toTeamCreate", () => {
    test("フォームデータを正しくTeamCreateに変換する", () => {
      const result = TeamFormConverter.toTeamCreate(validFormData);

      expect(result.teamName).toBe("東京拳法クラブ");
      expect(result.representativeName).toBe("田中 太郎");
      expect(result.representativePhone).toBe("090-1234-5678");
      expect(result.representativeEmail).toBe("tanaka@example.com");
      expect(result.remarks).toBe("特記事項なし");
      expect(result.isApproved).toBe(false);
      expect(result.players).toHaveLength(2);
    });
    test("選手データを正しく変換する", () => {
      const result = TeamFormConverter.toTeamCreate(validFormData);

      const player1 = result.players[0];
      expect(player1.playerId).toBe("player_mock-uuid-123");
      expect(player1.lastName).toBe("山田");
      expect(player1.firstName).toBe("太郎");
      expect(player1.displayName).toBe("山田 太"); // モックで生成される

      const player2 = result.players[1];
      expect(player2.lastName).toBe("佐藤");
      expect(player2.firstName).toBe("花子");
    });
  });

  describe("validateFormData", () => {
    test("有効なデータでバリデーションが通る", () => {
      const result = TeamFormConverter.validateFormData(validFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test("チーム名が空の場合エラーになる", () => {
      const invalidData = { ...validFormData, teamName: "" };
      const result = TeamFormConverter.validateFormData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes("チーム名"))).toBe(true);
    });

    test("代表者名が空の場合エラーになる", () => {
      const invalidData = { ...validFormData, representativeName: "" };
      const result = TeamFormConverter.validateFormData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes("代表者名"))).toBe(true);
    });

    test("無効なメールアドレスでエラーになる", () => {
      const invalidData = {
        ...validFormData,
        representativeEmail: "invalid-email",
      };
      const result = TeamFormConverter.validateFormData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes("メールアドレス"))).toBe(
        true
      );
    });

    test("選手名が不正な形式の場合エラーになる", () => {
      const invalidData = {
        ...validFormData,
        players: [
          { fullName: "山田 太郎" },
          { fullName: "単一名" }, // 姓名分割できない
        ],
      };
      const result = TeamFormConverter.validateFormData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes("選手2"))).toBe(true);
    });

    test("選手が0人の場合エラーになる", () => {
      const invalidData = { ...validFormData, players: [] };
      const result = TeamFormConverter.validateFormData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes("最低1人"))).toBe(true);
    });
  });
});
