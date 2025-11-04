/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAuthGuard, useGuestGuard, useAuth } from "./useAuth";
import { useAuthStore } from "@/store/use-auth-store";
import { AuthUser } from "@/lib/auth/types";

// Next.jsのuseRouterをモック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// useAuthStoreをモック
jest.mock("@/store/use-auth-store");

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const mockUser: AuthUser = {
  uid: "test-user-001",
  email: "test@example.com",
  displayName: "テストユーザー",
  emailVerified: true,
};

describe("useAuth hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe("useAuthGuard", () => {
    it("認証済みユーザーの場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuthGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isEmailVerified).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.displayName).toBe("テストユーザー");
    });

    it("未認証ユーザーの場合はログイン画面にリダイレクトする", () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      renderHook(() => useAuthGuard());

      expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    });

    it("初期化中の場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: false,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuthGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    it("ローディング中の場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: true,
        isLoading: true,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuthGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    it("メール未認証ユーザーの情報を正しく返す", () => {
      const unverifiedUser: AuthUser = {
        ...mockUser,
        emailVerified: false,
      };

      mockUseAuthStore.mockReturnValue({
        user: unverifiedUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuthGuard());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isEmailVerified).toBe(false);
    });
  });

  describe("useGuestGuard", () => {
    it("未認証ユーザーの場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useGuestGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("認証済みユーザーの場合はダッシュボードにリダイレクトする", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      renderHook(() => useGuestGuard());

      expect(mockRouter.replace).toHaveBeenCalledWith("/dashboard");
    });

    it("初期化中の場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: false,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useGuestGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });

    it("ローディング中の場合はリダイレクトしない", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: true,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useGuestGuard());

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useAuth", () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);

    it("認証状態を正しく返す（認証済み）", () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isEmailVerified).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.displayName).toBe("テストユーザー");
    });

    it("認証状態を正しく返す（未認証）", () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isEmailVerified).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.displayName).toBe("ゲスト");
    });

    it("signOut関数が正しく動作する", async () => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it("初期化中またはローディング中の場合はローディング状態を返す", () => {
      // 初期化中の場合
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: false,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      let { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(true);

      // ローディング中の場合
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: true,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      ({ result } = renderHook(() => useAuth()));
      expect(result.current.isLoading).toBe(true);
    });

    it("displayNameがnullの場合はデフォルト値を返す", () => {
      const userWithoutDisplayName: AuthUser = {
        ...mockUser,
        displayName: null,
      };

      mockUseAuthStore.mockReturnValue({
        user: userWithoutDisplayName,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: mockSignOut,
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.displayName).toBe("test@example.com");
    });
  });

  describe("ユーザー状態の変更に対する反応", () => {
    it("ユーザー状態が変更されるとリダイレクト処理が実行される", () => {
      // 最初は未認証
      mockUseAuthStore.mockReturnValue({
        user: null,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      const { rerender } = renderHook(() => useAuthGuard());

      expect(mockRouter.replace).toHaveBeenCalledWith("/login");

      // ユーザーがログインした状態に変更
      mockRouter.replace.mockClear();
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isInitialized: true,
        isLoading: false,
        error: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        clearError: jest.fn(),
        setUser: jest.fn(),
        setLoading: jest.fn(),
        setInitialized: jest.fn(),
        refreshAuth: jest.fn(),
      });

      rerender();

      // 認証済みになったのでリダイレクトしない
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });
});
