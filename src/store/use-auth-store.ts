import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/lib/auth/service";
import { AuthUser, AuthState } from "@/lib/auth/types";

interface AuthActions {
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    refreshAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

/**
 * 認証用のZustandストア
 * Firebase Authenticationと連携し、ログイン状態を管理
 */
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // 初期状態
            user: null,
            isLoading: false,
            isInitialized: false,
            error: null,

            // ログイン処理
            signIn: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const authUser = await AuthService.signInWithEmail(email, password);

                    set({
                        user: authUser,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "ログインに失敗しました";

                    set({
                        user: null,
                        isLoading: false,
                        error: errorMessage,
                    });

                    // Errorオブジェクトの場合はそのまま投げ、そうでなければ新しいErrorオブジェクトを作成
                    throw error instanceof Error ? error : new Error(errorMessage);
                }
            },

            // ログアウト処理
            signOut: async () => {
                try {
                    set({ isLoading: true, error: null });

                    await AuthService.signOut();

                    set({
                        user: null,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    const errorMessage = "ログアウトに失敗しました";
                    set({
                        isLoading: false,
                        error: errorMessage,
                    });
                    // Errorオブジェクトの場合はそのまま投げ、そうでなければ新しいErrorオブジェクトを作成
                    throw error instanceof Error ? error : new Error(errorMessage);
                }
            },

            // 認証状態のリフレッシュ
            refreshAuth: async () => {
                const { user } = get();
                if (user) {
                    await AuthService.refreshAuth();
                }
            },

            // エラークリア
            clearError: () => set({ error: null }),

            // ユーザー設定（認証状態変更時の内部使用）
            setUser: (user: AuthUser | null) => set({ user }),

            // ローディング状態設定
            setLoading: (loading: boolean) => set({ isLoading: loading }),

            // 初期化完了設定
            setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
        }),
        {
            name: "auth-store",
            partialize: (state) => ({ user: state.user }), // userのみを永続化
        }
    )
);

/**
 * Firebase Auth状態変更の監視を開始
 * アプリケーション起動時に一度だけ呼び出す
 */
export function initializeAuthListener() {
    const { setUser, setInitialized, setLoading } = useAuthStore.getState();

    setLoading(true);

    const unsubscribe = AuthService.onAuthStateChanged((authUser) => {
        setUser(authUser);
        setLoading(false);
        setInitialized(true);
    });

    return unsubscribe;
}