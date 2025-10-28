import { User } from "firebase/auth";

/**
 * 認証関連のユーザー型定義
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

/**
 * 認証状態の型定義
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Firebase User を AuthUser に変換するユーティリティ
 */
export function mapFirebaseUser(firebaseUser: User): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    emailVerified: firebaseUser.emailVerified,
  };
}

/**
 * ユーザーが認証済みかどうかを判定
 */
export function isAuthenticated(user: AuthUser | null): boolean {
  return user !== null;
}

/**
 * ユーザーのメールアドレスが認証済みかどうかを判定
 */
export function isEmailVerified(user: AuthUser | null): boolean {
  return user?.emailVerified ?? false;
}

/**
 * ユーザーの表示名を取得（フォールバック付き）
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return "ゲスト";
  
  return user.displayName || user.email || "ユーザー";
}

/**
 * ユーザーの初期化文字を取得（アバター用）
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return "?";
  
  const displayName = getUserDisplayName(user);
  
  // 日本語の場合は最初の1文字
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(displayName)) {
    return displayName.charAt(0);
  }
  
  // 英語の場合は名前の頭文字
  const words = displayName.split(" ");
  if (words.length >= 2) {
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }
  
  return displayName.charAt(0).toUpperCase();
}