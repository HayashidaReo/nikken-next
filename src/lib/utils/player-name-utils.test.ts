import {
  splitPlayerName,
  validatePlayerName,
  validatePlayerNames,
  formatPlayerFullName,
} from "./player-name-utils";

describe("player-name-utils", () => {
  test("splitPlayerName handles empty string", () => {
    const res = splitPlayerName("");
    expect(res.isValid).toBe(false);
    expect(res.lastName).toBe("");
    expect(res.firstName).toBe("");
  });

  test("splitPlayerName splits two-part name", () => {
    const res = splitPlayerName("山田 太郎");
    expect(res.isValid).toBe(true);
    expect(res.lastName).toBe("山田");
    expect(res.firstName).toBe("太郎");
  });

  test("splitPlayerName joins multiple first name parts", () => {
    const res = splitPlayerName("山田 太郎 次郎");
    expect(res.isValid).toBe(true);
    expect(res.lastName).toBe("山田");
    expect(res.firstName).toBe("太郎 次郎");
  });

  test("splitPlayerName returns invalid for single token", () => {
    const res = splitPlayerName("単一名");
    expect(res.isValid).toBe(false);
    expect(res.lastName).toBe("単一名");
    expect(res.firstName).toBe("");
  });

  test("validatePlayerName works", () => {
    expect(validatePlayerName("山田 太郎")).toBe(true);
    expect(validatePlayerName("単一")).toBe(false);
  });

  test("validatePlayerNames returns invalid indices", () => {
    const names = ["山田 太郎", "", "単一"];
    const invalid = validatePlayerNames(names);
    expect(invalid).toEqual([1, 2]);
  });

  test("formatPlayerFullName returns full name when present", () => {
    const players = [
      { lastName: "山田", firstName: "太郎" },
      { lastName: "佐藤", firstName: "花子" },
    ];
    expect(formatPlayerFullName(players, 0)).toBe("山田 太郎");
    expect(formatPlayerFullName(players, 1)).toBe("佐藤 花子");
  });

  test("formatPlayerFullName handles missing or empty names", () => {
    const players = [
      { lastName: "", firstName: "" },
      { lastName: "山田", firstName: "" },
    ];
    // When unable to construct a name, fallback to index-based label (1-indexed)
    expect(formatPlayerFullName(players, 0)).toBe("1番目の選手");
    expect(formatPlayerFullName(players, 1)).toBe("山田");
    expect(formatPlayerFullName(players, 10)).toBe("11番目の選手");
  });
});
