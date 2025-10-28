import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    emailVerified: boolean;
}

interface AuthState {
    // 状態
    user: AuthUser | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // アクション
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
}

/**
 * Firebase User を AuthUser に変換
 */
function mapFirebaseUser(firebaseUser: User): AuthUser {
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        emailVerified: firebaseUser.emailVerified,
    };
}

/**
 * 認証用のZustandストア
 * Firebase Authenticationと連携し、ログイン状態を管理
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // 初期状態
            user: null,
            isLoading: false,
            isInitialized: false,
            error: null,

            // ログイン処理
            signIn: async (email: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const authUser = mapFirebaseUser(userCredential.user);

                    set({
                        user: authUser,
                        isLoading: false,
                        error: null
                    });

                } catch (error) {
                    console.error("Sign in error:", error);

                    let errorMessage = "ログインに失敗しました";

                    if (error instanceof Error) {
                        // Firebase Authのエラーコードに基づく日本語メッセージ
                        switch (error.message) {
                            case "auth/user-not-found":
                                errorMessage = "このメールアドレスは登録されていません";
                                break;
                            case "auth/wrong-password":
                                errorMessage = "パスワードが正しくありません";
                                break;
                            case "auth/invalid-email":
                                errorMessage = "メールアドレスの形式が正しくありません";
                                break;
                            case "auth/user-disabled":
                                errorMessage = "このアカウントは無効化されています";
                                break;
                            case "auth/too-many-requests":
                                errorMessage = "ログイン試行回数が上限に達しました。しばらく待ってからお試しください";
                                break;
                            case "auth/network-request-failed":
                                errorMessage = "ネットワークエラーが発生しました";
                                break;
                            default:
                                // Firebase Auth v9のエラーコードがcode属性に入る場合がある
                                if ('code' in error) {
                                    const firebaseError = error as { code: string };
                                    switch (firebaseError.code) {
                                        case "auth/user-not-found":
                                            errorMessage = "このメールアドレスは登録されていません";
                                            break;
                                        case "auth/wrong-password":
                                            errorMessage = "パスワードが正しくありません";
                                            break;
                                        case "auth/invalid-email":
                                            errorMessage = "メールアドレスの形式が正しくありません";
                                            break;
                                        case "auth/user-disabled":
                                            errorMessage = "このアカウントは無効化されています";
                                            break;
                                        case "auth/too-many-requests":
                                            errorMessage = "ログイン試行回数が上限に達しました。しばらく待ってからお試しください";
                                            break;
                                        case "auth/network-request-failed":
                                            errorMessage = "ネットワークエラーが発生しました";
                                            break;
                                    }
                                }
                        }
                    }

                    set({
                        user: null,
                        isLoading: false,
                        error: errorMessage
                    });

                    throw new Error(errorMessage);
                }
            },

            // ログアウト処理
            signOut: async () => {
                try {
                    set({ isLoading: true, error: null });

                    await firebaseSignOut(auth);

                    set({
                        user: null,
                        isLoading: false,
                        error: null
                    });

                } catch (error) {
                    console.error("Sign out error:", error);
                    set({
                        isLoading: false,
                        error: "ログアウトに失敗しました"
                    });
                    throw error;
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
            name: "auth-store", // localStorage key
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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const authUser = mapFirebaseUser(firebaseUser);
            setUser(authUser);
        } else {
            setUser(null);
        }

        setLoading(false);
        setInitialized(true);
    });

    return unsubscribe;
}