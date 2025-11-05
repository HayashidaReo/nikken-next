/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useArrayField } from "./useArrayField";

describe("useArrayField", () => {
    interface TestForm {
        items: Array<{ id: string; name: string }>;
    }

    const setupHook = (options = {}) => {
        const { result } = renderHook(() => {
            const { control } = useForm<TestForm>({
                defaultValues: {
                    items: [{ id: "1", name: "Item 1" }],
                },
            });

            return useArrayField(control, "items", options);
        });

        return result;
    };

    describe("初期化", () => {
        it("フィールドが正しく初期化される", () => {
            const result = setupHook();

            expect(result.current.fields).toHaveLength(1);
            expect(result.current.itemCount).toBe(1);
        });

        it("canAddとcanRemoveが正しく設定される", () => {
            const result = setupHook({ minItems: 1, maxItems: 5 });

            expect(result.current.canAdd).toBe(true);
            expect(result.current.canRemove).toBe(false); // minItems=1なので削除不可
        });
    });

    describe("addItem", () => {
        it("アイテムを追加できる", () => {
            const result = setupHook();

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(result.current.fields).toHaveLength(2);
            expect(result.current.itemCount).toBe(2);
        });

        it("maxItemsに達すると追加できない", () => {
            const onMaxItemsReached = jest.fn();
            const result = setupHook({
                maxItems: 1,
                onMaxItemsReached,
            });

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(result.current.fields).toHaveLength(1); // 追加されない
            expect(onMaxItemsReached).toHaveBeenCalledWith(1);
        });

        it("デフォルトアイテムが使用される", () => {
            const result = setupHook({
                defaultItem: { name: "Default Name" },
            });

            act(() => {
                result.current.addItem();
            });

            expect(result.current.fields).toHaveLength(2);
        });

        it("onAddコールバックが呼ばれる", () => {
            const onAdd = jest.fn();
            const result = setupHook({ onAdd });

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(onAdd).toHaveBeenCalled();
        });
    });

    describe("removeItem", () => {
        it("アイテムを削除できる", () => {
            const result = setupHook({ minItems: 0 });

            act(() => {
                result.current.removeItem(0);
            });

            expect(result.current.fields).toHaveLength(0);
        });

        it("minItemsより少なくできない", () => {
            const onMinItemsRequired = jest.fn();
            const result = setupHook({
                minItems: 1,
                onMinItemsRequired,
            });

            act(() => {
                result.current.removeItem(0);
            });

            expect(result.current.fields).toHaveLength(1); // 削除されない
            expect(onMinItemsRequired).toHaveBeenCalledWith(1);
        });

        it("onRemoveコールバックが呼ばれる", () => {
            const onRemove = jest.fn();
            const result = setupHook({
                minItems: 0,
                onRemove,
            });

            act(() => {
                result.current.removeItem(0);
            });

            expect(onRemove).toHaveBeenCalledWith(0);
        });
    });

    describe("境界値テスト", () => {
        it("maxItemsちょうどまで追加できる", () => {
            const result = setupHook({ maxItems: 2 });

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(result.current.fields).toHaveLength(2);
            expect(result.current.canAdd).toBe(false);
        });

        it("minItemsちょうどまで削除できる", () => {
            const result = setupHook({ minItems: 1 });

            expect(result.current.canRemove).toBe(false);
            expect(result.current.fields).toHaveLength(1);
        });
    });

    describe("moveItemとswapItems", () => {
        it("moveItemが公開されている", () => {
            const result = setupHook();

            expect(typeof result.current.moveItem).toBe("function");
        });

        it("swapItemsが公開されている", () => {
            const result = setupHook();

            expect(typeof result.current.swapItems).toBe("function");
        });
    });

    describe("canAddとcanRemoveフラグ", () => {
        it("maxItemsなしの場合、常にcanAddがtrue", () => {
            const result = setupHook();

            expect(result.current.canAdd).toBe(true);

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(result.current.canAdd).toBe(true);
        });

        it("minItems以下の場合、canRemoveがfalse", () => {
            const result = setupHook({ minItems: 2 });

            expect(result.current.canRemove).toBe(false);
        });

        it("minItemsより多い場合、canRemoveがtrue", () => {
            const result = setupHook({ minItems: 1 });

            act(() => {
                result.current.addItem({ name: "Item 2" });
            });

            expect(result.current.canRemove).toBe(true);
        });
    });
});
