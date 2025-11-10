import { FirebaseError } from "firebase/app";
import { TEXT_MESSAGES } from "@/lib/constants";

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

    return TEXT_MESSAGES.UNEXPECTED_ERROR;
  }

  /**
   * Firebase Auth v9 エラーコードのマッピング
  */
  private static mapFirebaseErrorCode(errorCode: string): string {
    switch (errorCode) {
      // メールアドレスの形式が不正
      case "auth/invalid-email":
        return TEXT_MESSAGES.INVALID_EMAIL;

      // ユーザーアカウントが無効化されている
      case "auth/user-disabled":
        return TEXT_MESSAGES.USER_DISABLED;

      // セキュリティ考慮：ユーザーなしとパスワード誤りを同じメッセージにする
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return TEXT_MESSAGES.INVALID_CREDENTIALS;

      // ログイン試行回数が上限に達した
      case "auth/too-many-requests":
        return TEXT_MESSAGES.TOO_MANY_REQUESTS;

      // ネットワークエラー
      case "auth/network-request-failed":
        return TEXT_MESSAGES.NETWORK_ERROR;

      // その他の内部エラー
      case "auth/internal-error":
        return TEXT_MESSAGES.UNEXPECTED_ERROR;

      // パスワードリセット関連エラー
      case "auth/missing-email":
      case "auth/invalid-continue-uri":
      case "auth/unauthorized-continue-uri":
        return TEXT_MESSAGES.PASSWORD_RESET_EMAIL_ERROR;

      // 予期しないエラーコード
      default:
        return TEXT_MESSAGES.UNEXPECTED_ERROR;
    }
  }

  /**
   * 旧形式のエラーメッセージのマッピング（後方互換性）
   */
  private static mapLegacyErrorMessage(message: string): string {
    if (message.includes("user-not-found") || message.includes("wrong-password") || message.includes("invalid-credential")) {
      return TEXT_MESSAGES.INVALID_CREDENTIALS;
    }
    if (message.includes("invalid-email")) {
      return TEXT_MESSAGES.INVALID_EMAIL;
    }
    if (message.includes("too-many-requests")) {
      return TEXT_MESSAGES.TOO_MANY_REQUESTS;
    }
    if (message.includes("user-disabled")) {
      return TEXT_MESSAGES.USER_DISABLED;
    }

    return TEXT_MESSAGES.UNEXPECTED_ERROR;
  }
}
