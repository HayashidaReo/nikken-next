/**
 * @jest-environment jsdom
 */

import {
    DIALOG_OVERLAY_BACKGROUND,
    dialogOverlayStyle,
    DIALOG_OVERLAY_CLASSES,
} from "./dialog-styles";

describe("dialog-styles", () => {
    describe("DIALOG_OVERLAY_BACKGROUND", () => {
        it("正しいRGBA値が定義されている", () => {
            expect(DIALOG_OVERLAY_BACKGROUND).toBe("rgba(0, 0, 0, 0.3)");
        });

        it("黒色で30%の透明度を持つ", () => {
            // RGBA形式をパース
            const match = DIALOG_OVERLAY_BACKGROUND.match(
                /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
            );

            expect(match).not.toBeNull();
            expect(match?.[1]).toBe("0");   // Red
            expect(match?.[2]).toBe("0");   // Green
            expect(match?.[3]).toBe("0");   // Blue
            expect(parseFloat(match?.[4] || "0")).toBe(0.3); // Alpha
        });
    });

    describe("dialogOverlayStyle", () => {
        it("背景色スタイルオブジェクトが含まれる", () => {
            expect(dialogOverlayStyle).toHaveProperty("backgroundColor");
        });

        it("DIALOG_OVERLAY_BACKGROUNDと同じ背景色を持つ", () => {
            expect(dialogOverlayStyle.backgroundColor).toBe(DIALOG_OVERLAY_BACKGROUND);
        });

        it("オブジェクトとして機能する", () => {
            const style = { ...dialogOverlayStyle };
            expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0.3)");
        });
    });

    describe("DIALOG_OVERLAY_CLASSES", () => {
        it("Tailwind CSSクラスが含まれる", () => {
            expect(DIALOG_OVERLAY_CLASSES).toContain("fixed");
            expect(DIALOG_OVERLAY_CLASSES).toContain("inset-0");
            expect(DIALOG_OVERLAY_CLASSES).toContain("flex");
            expect(DIALOG_OVERLAY_CLASSES).toContain("items-center");
            expect(DIALOG_OVERLAY_CLASSES).toContain("justify-center");
            expect(DIALOG_OVERLAY_CLASSES).toContain("z-50");
        });

        it("複数のクラスがスペース区切りで連結されている", () => {
            const classes = DIALOG_OVERLAY_CLASSES.split(" ");
            expect(classes.length).toBeGreaterThan(1);
            expect(classes).toEqual([
                "fixed",
                "inset-0",
                "flex",
                "items-center",
                "justify-center",
                "z-50",
            ]);
        });

        it("固定レイアウト、全画面カバー、中央配置のクラスを持つ", () => {
            // fixed: 固定位置
            expect(DIALOG_OVERLAY_CLASSES).toContain("fixed");
            // inset-0: 全方向0（画面全体をカバー）
            expect(DIALOG_OVERLAY_CLASSES).toContain("inset-0");
            // flex, items-center, justify-center: 中央配置
            expect(DIALOG_OVERLAY_CLASSES).toContain("flex");
            expect(DIALOG_OVERLAY_CLASSES).toContain("items-center");
            expect(DIALOG_OVERLAY_CLASSES).toContain("justify-center");
        });

        it("高いz-indexを持つ", () => {
            expect(DIALOG_OVERLAY_CLASSES).toContain("z-50");
        });
    });

    describe("統合テスト", () => {
        it("スタイル定数とクラス定数が一貫性を持つ", () => {
            // スタイルの背景色が定義されている
            expect(dialogOverlayStyle.backgroundColor).toBeDefined();

            // クラスが定義されている
            expect(DIALOG_OVERLAY_CLASSES).toBeDefined();

            // 両者が存在する
            expect(DIALOG_OVERLAY_BACKGROUND).toBeDefined();
        });

        it("すべての定数がエクスポートされている", () => {
            expect(DIALOG_OVERLAY_BACKGROUND).not.toBeNull();
            expect(dialogOverlayStyle).not.toBeNull();
            expect(DIALOG_OVERLAY_CLASSES).not.toBeNull();
        });
    });
});
