import { cn } from "./utils";

describe("Utils Functions", () => {
  describe("cn (className merger)", () => {
    it("クラス名を正しく結合できる", () => {
      const result = cn("bg-red-500", "text-white");
      expect(result).toContain("bg-red-500");
      expect(result).toContain("text-white");
    });

    it("条件付きクラス名を処理できる", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("base-class");
      expect(result).toContain("active-class");
    });

    it("Tailwindの重複クラスをマージできる", () => {
      const result = cn("p-4", "p-2");
      expect(result).toBe("p-2");
    });

    it("falseな値は無視される", () => {
      const result = cn("base-class", false && "false-class", null, undefined);
      expect(result).toBe("base-class");
    });

    it("複雑なクラス結合でも正しく動作する", () => {
      const result = cn(
        "px-4 py-2",
        "bg-blue-500 hover:bg-blue-600",
        "text-white",
        "px-6" // px-4をオーバーライド
      );
      expect(result).toContain("px-6");
      expect(result).toContain("py-2");
      expect(result).toContain("bg-blue-500");
      expect(result).toContain("hover:bg-blue-600");
      expect(result).toContain("text-white");
      expect(result).not.toContain("px-4");
    });

    it("空の引数でも動作する", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("配列形式のクラス名も処理できる", () => {
      const result = cn(["bg-red-500", "text-white"], "p-4");
      expect(result).toContain("bg-red-500");
      expect(result).toContain("text-white");
      expect(result).toContain("p-4");
    });
  });
});
