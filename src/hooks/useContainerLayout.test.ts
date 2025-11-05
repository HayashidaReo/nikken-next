/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { useContainerLayout } from "./useContainerLayout";

describe("useContainerLayout", () => {
    describe("デフォルト設定", () => {
        it("デフォルト値で初期化される", () => {
            const { result } = renderHook(() => useContainerLayout());

            expect(result.current.maxWidth).toBe("4xl");
            expect(result.current.centered).toBe(true);
            expect(result.current.spacing).toBe("normal");
            expect(result.current.containerClassName).toContain("max-w-4xl");
            expect(result.current.containerClassName).toContain("mx-auto");
            expect(result.current.containerClassName).toContain("space-y-6");
            expect(result.current.containerClassName).toContain("w-full");
        });
    });

    describe("maxWidth設定", () => {
        it("smサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "sm" })
            );

            expect(result.current.maxWidth).toBe("sm");
            expect(result.current.containerClassName).toContain("max-w-sm");
        });

        it("mdサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "md" })
            );

            expect(result.current.containerClassName).toContain("max-w-md");
        });

        it("lgサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "lg" })
            );

            expect(result.current.containerClassName).toContain("max-w-lg");
        });

        it("xlサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "xl" })
            );

            expect(result.current.containerClassName).toContain("max-w-xl");
        });

        it("2xlサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "2xl" })
            );

            expect(result.current.containerClassName).toContain("max-w-2xl");
        });

        it("6xlサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "6xl" })
            );

            expect(result.current.containerClassName).toContain("max-w-6xl");
        });

        it("fullサイズが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ maxWidth: "full" })
            );

            expect(result.current.containerClassName).toContain("w-full");
            expect(result.current.containerClassName).not.toContain("max-w");
        });
    });

    describe("centered設定", () => {
        it("centered=trueで中央配置される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ centered: true })
            );

            expect(result.current.centered).toBe(true);
            expect(result.current.containerClassName).toContain("mx-auto");
        });

        it("centered=falseで中央配置されない", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ centered: false })
            );

            expect(result.current.centered).toBe(false);
            expect(result.current.containerClassName).not.toContain("mx-auto");
        });
    });

    describe("spacing設定", () => {
        it("tightスペーシングが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ spacing: "tight" })
            );

            expect(result.current.spacing).toBe("tight");
            expect(result.current.containerClassName).toContain("space-y-3");
        });

        it("normalスペーシングが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ spacing: "normal" })
            );

            expect(result.current.spacing).toBe("normal");
            expect(result.current.containerClassName).toContain("space-y-6");
        });

        it("looseスペーシングが適用される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ spacing: "loose" })
            );

            expect(result.current.spacing).toBe("loose");
            expect(result.current.containerClassName).toContain("space-y-8");
        });
    });

    describe("カスタムクラス名", () => {
        it("カスタムクラス名が追加される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ className: "custom-class" })
            );

            expect(result.current.containerClassName).toContain("custom-class");
        });

        it("複数のカスタムクラス名が追加される", () => {
            const { result } = renderHook(() =>
                useContainerLayout({ className: "custom-1 custom-2" })
            );

            expect(result.current.containerClassName).toContain("custom-1");
            expect(result.current.containerClassName).toContain("custom-2");
        });
    });

    describe("複合設定", () => {
        it("すべてのオプションを組み合わせられる", () => {
            const { result } = renderHook(() =>
                useContainerLayout({
                    maxWidth: "xl",
                    centered: false,
                    spacing: "tight",
                    className: "my-custom-class",
                })
            );

            expect(result.current.maxWidth).toBe("xl");
            expect(result.current.centered).toBe(false);
            expect(result.current.spacing).toBe("tight");
            expect(result.current.containerClassName).toContain("max-w-xl");
            expect(result.current.containerClassName).not.toContain("mx-auto");
            expect(result.current.containerClassName).toContain("space-y-3");
            expect(result.current.containerClassName).toContain("my-custom-class");
            expect(result.current.containerClassName).toContain("w-full");
        });
    });

    describe("返り値の構造", () => {
        it("必要なプロパティがすべて含まれる", () => {
            const { result } = renderHook(() => useContainerLayout());

            expect(result.current).toHaveProperty("containerClassName");
            expect(result.current).toHaveProperty("maxWidth");
            expect(result.current).toHaveProperty("centered");
            expect(result.current).toHaveProperty("spacing");
        });

        it("containerClassNameは文字列", () => {
            const { result } = renderHook(() => useContainerLayout());

            expect(typeof result.current.containerClassName).toBe("string");
        });
    });
});
