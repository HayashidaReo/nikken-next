import {
  formatDateToInputValue,
  parseInputValueToDate,
  formatDateForDisplay,
  isSameDate,
} from "./date-utils";

describe("date-utils", () => {
  describe("formatDateToInputValue", () => {
    it("Date型を正しくYYYY-MM-DD形式に変換する", () => {
      const date = new Date("2024-03-15T10:30:00.000Z");
      const result = formatDateToInputValue(date);
      expect(result).toBe("2024-03-15");
    });

    it("文字列型の日付を正しく変換する", () => {
      const result = formatDateToInputValue("2024-03-15T10:30:00.000Z");
      expect(result).toBe("2024-03-15");
    });

    it("Firestore形式のISO文字列を正しく変換する（タイムゾーン考慮）", () => {
      // UTC 15:00は日本時間では翌日の00:00（JST = UTC+9）
      const result = formatDateToInputValue("2025-11-13T15:00:00.000Z");
      expect(result).toBe("2025-11-14");
    });

    it("様々なUTC時間のISO文字列を正しく変換する", () => {
      // UTC 00:00 → JST 09:00（同日）
      expect(formatDateToInputValue("2025-11-13T00:00:00.000Z")).toBe(
        "2025-11-13"
      );
      // UTC 14:59 → JST 23:59（同日）
      expect(formatDateToInputValue("2025-11-13T14:59:00.000Z")).toBe(
        "2025-11-13"
      );
      // UTC 15:00 → JST 00:00（翌日）
      expect(formatDateToInputValue("2025-11-13T15:00:00.000Z")).toBe(
        "2025-11-14"
      );
      // UTC 23:59 → JST 08:59（翌日）
      expect(formatDateToInputValue("2025-11-13T23:59:00.000Z")).toBe(
        "2025-11-14"
      );
    });

    it("nullやundefinedの場合は空文字列を返す", () => {
      expect(formatDateToInputValue(null)).toBe("");
      expect(formatDateToInputValue(undefined)).toBe("");
    });

    it("無効な日付の場合は空文字列を返す", () => {
      expect(formatDateToInputValue("invalid-date")).toBe("");
      expect(formatDateToInputValue(new Date("invalid"))).toBe("");
    });

    it("不正な型の場合は空文字列を返す", () => {
      expect(formatDateToInputValue(123 as unknown as Date)).toBe("");
      expect(formatDateToInputValue({} as unknown as Date)).toBe("");
    });

    it("過去の日付でも正しく変換する", () => {
      const pastDate = new Date("2024-03-15");
      const result = formatDateToInputValue(pastDate);
      expect(result).toBe("2024-03-15");
    });
  });

  describe("parseInputValueToDate", () => {
    it("YYYY-MM-DD形式の文字列をDate型に変換する", () => {
      const result = parseInputValueToDate("2024-03-15");
      expect(result).not.toBeNull();
      if (result) {
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(2); // 月は0ベース
        expect(result.getDate()).toBe(15);
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
      }
    });

    it("空文字列の場合はnullを返す", () => {
      const result = parseInputValueToDate("");
      expect(result).toBeNull();
    });

    it("不正な形式の文字列の場合はnullを返す", () => {
      expect(parseInputValueToDate("invalid-date")).toBeNull();
      expect(parseInputValueToDate("2024-13-01")).toBeNull(); // 無効な月
      expect(parseInputValueToDate("2024-02-30")).toBeNull(); // 無効な日
    });
  });

  describe("formatDateForDisplay", () => {
    it("日本語ロケールで正しく表示用文字列に変換する", () => {
      const date = new Date("2024-03-15T10:30:00.000Z");
      const result = formatDateForDisplay(date);
      expect(result).toMatch(/2024年3月15日/);
    });

    it("英語ロケールで正しく表示用文字列に変換する", () => {
      const date = new Date("2024-03-15T10:30:00.000Z");
      const result = formatDateForDisplay(date, "en-US");
      expect(result).toMatch(/March 15, 2024/);
    });

    it("無効な日付の場合は空文字列を返す", () => {
      expect(formatDateForDisplay(new Date("invalid"))).toBe("");
      expect(formatDateForDisplay(null)).toBe("");
      expect(formatDateForDisplay(undefined)).toBe("");
    });
  });

  describe("isSameDate", () => {
    it("同じ日付の場合はtrueを返す", () => {
      const date1 = new Date("2024-03-15T00:00:00");
      const date2 = new Date("2024-03-15T23:59:59");
      expect(isSameDate(date1, date2)).toBe(true);
    });

    it("異なる日付の場合はfalseを返す", () => {
      const date1 = new Date("2024-03-15T00:00:00");
      const date2 = new Date("2024-03-16T00:00:00");
      expect(isSameDate(date1, date2)).toBe(false);
    });

    it("nullやundefinedの場合はfalseを返す", () => {
      const date = new Date("2024-03-15T10:30:00.000Z");
      expect(isSameDate(date, null as unknown as Date)).toBe(false);
      expect(isSameDate(null as unknown as Date, date)).toBe(false);
      expect(isSameDate(null as unknown as Date, null as unknown as Date)).toBe(
        false
      );
    });
  });
});
