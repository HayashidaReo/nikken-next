/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useAuthStore, initializeAuthListener } from "./use-auth-store";
import { AuthService } from "@/lib/auth/service";
import { AuthUser } from "@/lib/auth/types";

// AuthServiceのモック
jest.mock("@/lib/auth/service");
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

// console.errorをモック化してログ出力を抑制
const originalConsoleError = console.error;

// localStorageのモック
const mockStorage: { [key: string]: string } = {};

beforeEach(() => {
  // Zustandストアの状態をリセット
  useAuthStore.setState({
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,
  });

  // モック関数をクリア
  jest.clearAllMocks();

  // console.errorをモック化
  console.error = jest.fn();

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

afterEach(() => {
  console.error = originalConsoleError;
});

describe("useAuthStore", () => {
  const mockUser: AuthUser = {
    uid: "test-user-001",
    email: "test@example.com",
    displayName: "テストユーザー",
    emailVerified: true,
  };

  describe("初期状態", () => {
    it("正しい初期値を持つ", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("signIn", () => {
    it("成功時にユーザーが設定される", async () => {
      mockAuthService.signInWithEmail.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockAuthService.signInWithEmail).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    it("ローディング状態が正しく管理される", async () => {
      mockAuthService.signInWithEmail.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      const { result } = renderHook(() => useAuthStore());

      let signInPromise: Promise<void>;
      act(() => {
        signInPromise = result.current.signIn(
          "test@example.com",
          "password123"
        );
      });

      // ローディング中
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await signInPromise;
      });

      // ローディング完了
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
    });

    it("失敗時にエラーが設定される", async () => {
      const errorMessage = "ログイン失敗";
      mockAuthService.signInWithEmail.mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useAuthStore());

      // React状態更新の警告を避けるため、非同期更新を適切に処理
      await act(async () => {
        await expect(
          result.current.signIn("test@example.com", "wrongpassword")
        ).rejects.toThrow(errorMessage);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it("Error以外の例外の場合はデフォルトメッセージが設定される", async () => {
      mockAuthService.signInWithEmail.mockRejectedValue("string error");

      const { result } = renderHook(() => useAuthStore());

      // React状態更新の警告を避けるため、非同期更新を適切に処理
      await act(async () => {
        await expect(
          result.current.signIn("test@example.com", "password123")
        ).rejects.toThrow("ログインに失敗しました");
      });

      expect(result.current.error).toBe("ログインに失敗しました");
    });
  });

  describe("signOut", () => {
    it("成功時にユーザーがクリアされる", async () => {
      mockAuthService.signOut.mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      // 先にユーザーを設定
      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockAuthService.signOut).toHaveBeenCalled();
    });

    it("失敗時にエラーが設定される", async () => {
      mockAuthService.signOut.mockRejectedValue(new Error("サインアウト失敗"));

      const { result } = renderHook(() => useAuthStore());

      // 先にユーザーを設定
      act(() => {
        result.current.setUser(mockUser);
      });

      await act(async () => {
        try {
          await result.current.signOut();
        } catch {
          // エラーがthrowされることを確認
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("ログアウトに失敗しました");
    });
  });

  describe("refreshAuth", () => {
    it("ユーザーが存在する場合のみrefreshAuthを呼び出す", async () => {
      mockAuthService.refreshAuth.mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      // ユーザーが存在しない場合
      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(mockAuthService.refreshAuth).not.toHaveBeenCalled();

      // ユーザーが存在する場合
      act(() => {
        result.current.setUser(mockUser);
      });

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(mockAuthService.refreshAuth).toHaveBeenCalled();
    });
  });

  describe("その他のアクション", () => {
    it("clearErrorでエラーがクリアされる", () => {
      const { result } = renderHook(() => useAuthStore());

      // エラーを設定
      act(() => {
        result.current.signIn("test@example.com", "password").catch(() => {});
      });

      // エラーをクリア
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it("setUserでユーザーが設定される", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
    });

    it("setLoadingでローディング状態が設定される", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("setInitializedで初期化状態が設定される", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setInitialized(true);
      });

      expect(result.current.isInitialized).toBe(true);

      act(() => {
        result.current.setInitialized(false);
      });

      expect(result.current.isInitialized).toBe(false);
    });
  });

  describe("initializeAuthListener", () => {
    it("認証状態の監視を開始する", () => {
      const mockUnsubscribe = jest.fn();
      const mockCallback = jest.fn();

      mockAuthService.onAuthStateChanged.mockImplementation(callback => {
        mockCallback.mockImplementation(callback);
        return mockUnsubscribe;
      });

      const unsubscribe = initializeAuthListener();

      expect(mockAuthService.onAuthStateChanged).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe("function");

      // 認証状態変更をシミュレート
      act(() => {
        mockCallback(mockUser);
      });

      const currentState = useAuthStore.getState();
      expect(currentState.user).toEqual(mockUser);
      expect(currentState.isLoading).toBe(false);
      expect(currentState.isInitialized).toBe(true);
    });

    it("初期化時にローディング状態を設定する", () => {
      const mockUnsubscribe = jest.fn();
      mockAuthService.onAuthStateChanged.mockReturnValue(mockUnsubscribe);

      initializeAuthListener();

      const currentState = useAuthStore.getState();
      expect(currentState.isLoading).toBe(true);
    });
  });

  describe("複合的なシナリオ", () => {
    it("ログイン → ログアウトの流れを正しく処理する", async () => {
      mockAuthService.signInWithEmail.mockResolvedValue(mockUser);
      mockAuthService.signOut.mockResolvedValue();

      const { result } = renderHook(() => useAuthStore());

      // ログイン
      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();

      // ログアウト
      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("連続したアクションでエラー状態が正しく管理される", async () => {
      const { result } = renderHook(() => useAuthStore());

      // 最初にエラーが発生
      mockAuthService.signInWithEmail.mockRejectedValue(
        new Error("最初のエラー")
      );

      await act(async () => {
        await expect(
          result.current.signIn("test@example.com", "wrongpassword")
        ).rejects.toThrow("最初のエラー");
      });

      expect(result.current.error).toBe("最初のエラー");

      // 次に成功
      mockAuthService.signInWithEmail.mockResolvedValue(mockUser);

      await act(async () => {
        await result.current.signIn("test@example.com", "correctpassword");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull(); // エラーがクリアされる
    });
  });
});
