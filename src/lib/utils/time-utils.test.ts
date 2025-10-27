import {
  formatTime,
  parseTimeString,
  formatTimeReadable
} from "./time-utils";

describe("time-utils", () => {
  describe("formatTime", () => {
    it("0秒の場合は0:00を返す", () => {
      const result = formatTime(0);
      expect(result).toBe("0:00");
    });

    it("59秒以下の場合は0:XX形式で返す", () => {
      expect(formatTime(30)).toBe("0:30");
      expect(formatTime(59)).toBe("0:59");
      expect(formatTime(5)).toBe("0:05");
    });

    it("1分の場合は1:00を返す", () => {
      const result = formatTime(60);
      expect(result).toBe("1:00");
    });

    it("1分を超える場合は適切にフォーマットする", () => {
      expect(formatTime(90)).toBe("1:30");
      expect(formatTime(125)).toBe("2:05");
      expect(formatTime(3661)).toBe("61:01");
    });

    it("大きな数値でも正しく処理する", () => {
      expect(formatTime(3600)).toBe("60:00"); // 1時間
      expect(formatTime(7200)).toBe("120:00"); // 2時間
    });

    it("秒数が一桁の場合、ゼロパディングされる", () => {
      expect(formatTime(61)).toBe("1:01");
      expect(formatTime(122)).toBe("2:02");
      expect(formatTime(183)).toBe("3:03");
    });
  });

  describe("parseTimeString", () => {
    it("0:00の場合は0を返す", () => {
      const result = parseTimeString("0:00");
      expect(result).toBe(0);
    });

    it("分:秒形式を正しく秒数に変換する", () => {
      expect(parseTimeString("1:30")).toBe(90);
      expect(parseTimeString("2:05")).toBe(125);
      expect(parseTimeString("5:00")).toBe(300);
    });

    it("大きな分数でも正しく処理する", () => {
      expect(parseTimeString("60:00")).toBe(3600);
      expect(parseTimeString("120:30")).toBe(7230);
    });

    it("不正な形式の場合でも処理する", () => {
      expect(parseTimeString("")).toBe(0);
      expect(parseTimeString("5")).toBe(300); // 分のみの場合、5分として解釈
      expect(parseTimeString("abc:def")).toBe(0); // 数値でない
    });

    it("一方が空文字列や無効な値の場合はデフォルト値0を使用", () => {
      expect(parseTimeString(":30")).toBe(30); // 分が空
      expect(parseTimeString("5:")).toBe(300); // 秒が空
    });

    it("ゼロパディングされた値でも正しく処理する", () => {
      expect(parseTimeString("01:05")).toBe(65);
      expect(parseTimeString("05:09")).toBe(309);
    });
  });

  describe("formatTimeReadable", () => {
    it("0秒の場合は「0秒」を返す", () => {
      const result = formatTimeReadable(0);
      expect(result).toBe("0秒");
    });

    it("秒のみの場合は「X秒」形式で返す", () => {
      expect(formatTimeReadable(30)).toBe("30秒");
      expect(formatTimeReadable(59)).toBe("59秒");
      expect(formatTimeReadable(5)).toBe("5秒");
    });

    it("分のみの場合は「X分」形式で返す", () => {
      expect(formatTimeReadable(60)).toBe("1分");
      expect(formatTimeReadable(120)).toBe("2分");
      expect(formatTimeReadable(300)).toBe("5分");
    });

    it("分と秒がある場合は「X分Y秒」形式で返す", () => {
      expect(formatTimeReadable(90)).toBe("1分30秒");
      expect(formatTimeReadable(125)).toBe("2分5秒");
      expect(formatTimeReadable(3661)).toBe("61分1秒");
    });

    it("大きな数値でも正しく処理する", () => {
      expect(formatTimeReadable(3600)).toBe("60分"); // 1時間
      expect(formatTimeReadable(3661)).toBe("61分1秒"); // 1時間1分1秒
      expect(formatTimeReadable(7260)).toBe("121分"); // 2時間1分（0秒は表示しない）
    });

    it("1分未満の場合は分を表示しない", () => {
      expect(formatTimeReadable(45)).toBe("45秒");
      expect(formatTimeReadable(1)).toBe("1秒");
    });

    it("端数なしの分の場合は秒を表示しない", () => {
      expect(formatTimeReadable(180)).toBe("3分");
      expect(formatTimeReadable(600)).toBe("10分");
    });
  });

  describe("相互変換のテスト", () => {
    it("formatTime -> parseTimeString で元の値に戻る", () => {
      const testValues = [0, 30, 60, 90, 125, 300, 3600, 3661];
      
      testValues.forEach(seconds => {
        const formatted = formatTime(seconds);
        const parsed = parseTimeString(formatted);
        expect(parsed).toBe(seconds);
      });
    });

    it("parseTimeString -> formatTime で一貫性がある", () => {
      const testStrings = ["0:00", "1:30", "2:05", "5:00", "60:00", "61:01"];
      
      testStrings.forEach(timeString => {
        const parsed = parseTimeString(timeString);
        const formatted = formatTime(parsed);
        expect(formatted).toBe(timeString);
      });
    });
  });
});