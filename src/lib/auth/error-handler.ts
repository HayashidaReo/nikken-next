import { FirebaseError } from "firebase/app";

/**
 * Firebase Authentication エラーを日本語メッセージに変換するユーティリティ
 */
export class AuthErrorHandler {
  /**
   * Firebase Auth エラーを日本語のユーザーフレンドリーなメッセージに変換
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof FirebaseError) {
      return this.mapFirebaseErrorCode(error.code);
    }

    if (error instanceof Error) {
      // 古い形式のエラーメッセージも処理
      return this.mapLegacyErrorMessage(error.message);
    }

    return "予期しないエラーが発生しました";
  }

  /**
   * Firebase Auth v9 エラーコードのマッピング
   */
  private static mapFirebaseErrorCode(errorCode: string): string {
    const errorMap: Record<string, string> = {
      // 認証エラー
      "auth/user-not-found": "このメールアドレスは登録されていません",
      "auth/wrong-password": "パスワードが正しくありません", 
      "auth/invalid-email": "メールアドレスの形式が正しくありません",
      "auth/user-disabled": "このアカウントは無効化されています",
      "auth/email-already-in-use": "このメールアドレスは既に使用されています",
      
      // セキュリティ関連
      "auth/too-many-requests": "ログイン試行回数が上限に達しました。しばらく待ってからお試しください",
      "auth/weak-password": "パスワードが短すぎます。6文字以上で設定してください",
      
      // ネットワーク関連
      "auth/network-request-failed": "ネットワークエラーが発生しました。接続を確認してください",
      "auth/internal-error": "内部エラーが発生しました。しばらく待ってからお試しください",
      
      // パスワードリセット関連
      "auth/expired-action-code": "パスワードリセットリンクの有効期限が切れています",
      "auth/invalid-action-code": "パスワードリセットリンクが無効です",
      
      // トークン関連
      "auth/id-token-expired": "認証の有効期限が切れました。再度ログインしてください",
      "auth/id-token-revoked": "認証が無効化されました。再度ログインしてください",
    };

    return errorMap[errorCode] || `認証エラーが発生しました (${errorCode})`;
  }

  /**
   * 旧形式のエラーメッセージのマッピング（後方互換性）
   */
  private static mapLegacyErrorMessage(message: string): string {
    if (message.includes("user-not-found")) {
      return "このメールアドレスは登録されていません";
    }
    if (message.includes("wrong-password")) {
      return "パスワードが正しくありません";
    }
    if (message.includes("invalid-email")) {
      return "メールアドレスの形式が正しくありません";
    }
    if (message.includes("too-many-requests")) {
      return "ログイン試行回数が上限に達しました。しばらく待ってからお試しください";
    }

    return "ログインに失敗しました";
  }

  /**
   * 開発者向けの詳細なエラー情報をログ出力
   */
  static logError(operation: string, error: unknown): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔐 Auth Error in ${operation}`);
      console.error("Error details:", error);
      
      if (error instanceof FirebaseError) {
        console.log("Firebase Error Code:", error.code);
        console.log("Firebase Error Message:", error.message);
      }
      
      console.groupEnd();
    }
  }
}