/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

// localStorageのモック
const mockStorage: { [key: string]: string } = {};

beforeEach(() => {
  // localStorageのモック実装
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn((key: string) => mockStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      }),
    },
    writable: true,
  });

  // mockStorageをクリア
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
});

describe("useLocalStorage", () => {
  describe("基本機能", () => {
    it("デフォルト値を返す（ローカルストレージが空の場合）", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      const [value] = result.current;
      expect(value).toBe("default");
    });

    it("ローカルストレージに存在する値を読み込む", () => {
      mockStorage["test-key"] = JSON.stringify("stored-value");

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      const [value] = result.current;
      expect(value).toBe("stored-value");
    });

    it("値を設定してローカルストレージに保存する", () => {
      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      act(() => {
        const [, setValue] = result.current;
        setValue("new-value");
      });

      const [value] = result.current;
      expect(value).toBe("new-value");
      expect(mockStorage["test-key"]).toBe(JSON.stringify("new-value"));
    });

    it("関数を使って値を更新する", () => {
      const { result } = renderHook(() => useLocalStorage("test-key", 10));

      act(() => {
        const [, setValue] = result.current;
        setValue(prev => prev + 5);
      });

      const [value] = result.current;
      expect(value).toBe(15);
      expect(mockStorage["test-key"]).toBe(JSON.stringify(15));
    });

    it("値を削除してデフォルト値に戻す", () => {
      mockStorage["test-key"] = JSON.stringify("stored-value");

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      act(() => {
        const [, , removeValue] = result.current;
        removeValue();
      });

      const [value] = result.current;
      expect(value).toBe("default");
      expect(mockStorage["test-key"]).toBeUndefined();
    });
  });

  describe("型のテスト", () => {
    it("オブジェクト型を正しく処理する", () => {
      const defaultObj = { name: "test", count: 0 };
      mockStorage["test-key"] = JSON.stringify({ name: "stored", count: 5 });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", defaultObj)
      );

      const [value] = result.current;
      expect(value).toEqual({ name: "stored", count: 5 });
    });

    it("配列型を正しく処理する", () => {
      const defaultArray = [1, 2, 3];
      mockStorage["test-key"] = JSON.stringify([4, 5, 6]);

      const { result } = renderHook(() =>
        useLocalStorage("test-key", defaultArray)
      );

      const [value] = result.current;
      expect(value).toEqual([4, 5, 6]);
    });

    it("真偽値型を正しく処理する", () => {
      mockStorage["test-key"] = JSON.stringify(true);

      const { result } = renderHook(() => useLocalStorage("test-key", false));

      const [value] = result.current;
      expect(value).toBe(true);
    });
  });

  describe("カスタムシリアライザーのテスト", () => {
    it("カスタムシリアライザーを使用して値を保存・読み込みする", () => {
      const serializer = {
        serialize: (value: Date) => value.toISOString(),
        deserialize: (value: string) => new Date(value),
      };

      const testDate = new Date("2023-01-01");
      mockStorage["test-key"] = testDate.toISOString();

      const { result } = renderHook(() =>
        useLocalStorage("test-key", new Date("2020-01-01"), serializer)
      );

      const [value] = result.current;
      expect(value).toEqual(testDate);
    });

    it("カスタムシリアライザーで値を設定する", () => {
      const serializer = {
        serialize: (value: Date) => value.toISOString(),
        deserialize: (value: string) => new Date(value),
      };

      const { result } = renderHook(() =>
        useLocalStorage("test-key", new Date("2020-01-01"), serializer)
      );

      const newDate = new Date("2023-12-25");

      act(() => {
        const [, setValue] = result.current;
        setValue(newDate);
      });

      const [value] = result.current;
      expect(value).toEqual(newDate);
      expect(mockStorage["test-key"]).toBe(newDate.toISOString());
    });
  });

  describe("エラーハンドリング", () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("JSON.parseエラー時にデフォルト値を返す", () => {
      mockStorage["test-key"] = "invalid-json";

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      const [value] = result.current;
      expect(value).toBe("default");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading localStorage key "test-key"'),
        expect.any(Error)
      );
    });

    it("setItem エラーをキャッチして処理する", () => {
      // setItemでエラーを発生させるモック
      const mockSetItem = jest.fn().mockImplementation(() => {
        throw new Error("Quota exceeded");
      });

      Object.defineProperty(window, "localStorage", {
        value: {
          ...window.localStorage,
          setItem: mockSetItem,
        },
        writable: true,
      });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      act(() => {
        const [, setValue] = result.current;
        setValue("new-value");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error setting localStorage key "test-key"'),
        expect.any(Error)
      );
    });

    it("removeItem エラーをキャッチして処理する", () => {
      // removeItemでエラーを発生させるモック
      const mockRemoveItem = jest.fn().mockImplementation(() => {
        throw new Error("Access denied");
      });

      Object.defineProperty(window, "localStorage", {
        value: {
          ...window.localStorage,
          removeItem: mockRemoveItem,
        },
        writable: true,
      });

      const { result } = renderHook(() =>
        useLocalStorage("test-key", "default")
      );

      act(() => {
        const [, , removeValue] = result.current;
        removeValue();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error removing localStorage key "test-key"'),
        expect.any(Error)
      );
    });
  });
});
