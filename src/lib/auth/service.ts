import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    User,
    Unsubscribe,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { AuthUser, mapFirebaseUser } from "./types";
import { AuthErrorHandler } from "./error-handler";

/**
 * Firebase Authentication サービスクラス
 * 認証関連の操作を集約し、エラーハンドリングを統一
 */
export class AuthService {
    /**
     * メールアドレスとパスワードでサインイン
     */
    static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return mapFirebaseUser(userCredential.user);
        } catch (error) {
            AuthErrorHandler.logError("signInWithEmail", error);
            throw new Error(AuthErrorHandler.getErrorMessage(error));
        }
    }

    /**
     * サインアウト
     */
    static async signOut(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            AuthErrorHandler.logError("signOut", error);
            throw new Error(AuthErrorHandler.getErrorMessage(error));
        }
    }

    /**
     * パスワードリセットメール送信
     */
    static async sendPasswordResetEmail(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            AuthErrorHandler.logError("sendPasswordResetEmail", error);
            throw new Error(AuthErrorHandler.getErrorMessage(error));
        }
    }

    /**
     * 認証状態変更の監視
     */
    static onAuthStateChanged(callback: (user: AuthUser | null) => void): Unsubscribe {
        return onAuthStateChanged(auth, (firebaseUser: User | null) => {
            const authUser = firebaseUser ? mapFirebaseUser(firebaseUser) : null;
            callback(authUser);
        });
    }

    /**
     * 現在のユーザー情報を取得
     */
    static getCurrentUser(): AuthUser | null {
        const firebaseUser = auth.currentUser;
        return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
    }

    /**
     * 認証状態のリフレッシュ
     */
    static async refreshAuth(): Promise<void> {
        try {
            if (auth.currentUser) {
                await auth.currentUser.reload();
            }
        } catch (error) {
            AuthErrorHandler.logError("refreshAuth", error);
            // リフレッシュエラーは致命的でないため、エラーを投げない
            console.warn("Failed to refresh authentication state");
        }
    }
}