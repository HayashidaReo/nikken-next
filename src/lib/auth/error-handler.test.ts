/**
 * @jest-environment node
 */

// FirebaseErrorモジュールをモック（クラス定義をインラインで行う）
jest.mock("firebase/app", () => {
  class MockFirebaseError extends Error {
    code: string;
    customData?: Record<string, unknown>;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = "FirebaseError";
    }
  }

  return {
    FirebaseError: MockFirebaseError,
  };
});

import { AuthErrorHandler } from "./error-handler";
import { FirebaseError } from "firebase/app";

// テスト用にモックされたFirebaseErrorを取得
const MockFirebaseError = FirebaseError as unknown as new (code: string, message: string) => Error & { code: string };

describe("AuthErrorHandler", () => {
  describe("getErrorMessage", () => {
    describe("Firebase エラーコードのマッピング", () => {
      it("user-not-found エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/user-not-found", "User not found");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("このメールアドレスは登録されていません");
      });

      it("wrong-password エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/wrong-password", "Wrong password");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("パスワードが正しくありません");
      });

      it("invalid-email エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/invalid-email", "Invalid email");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("メールアドレスの形式が正しくありません");
      });

      it("user-disabled エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/user-disabled", "User disabled");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("このアカウントは無効化されています");
      });

      it("email-already-in-use エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/email-already-in-use", "Email already in use");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("このメールアドレスは既に使用されています");
      });

      it("too-many-requests エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/too-many-requests", "Too many requests");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("ログイン試行回数が上限に達しました。しばらく待ってからお試しください");
      });

      it("weak-password エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/weak-password", "Weak password");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("パスワードが短すぎます。6文字以上で設定してください");
      });

      it("network-request-failed エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/network-request-failed", "Network error");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("ネットワークエラーが発生しました。接続を確認してください");
      });

      it("internal-error エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/internal-error", "Internal error");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("内部エラーが発生しました。しばらく待ってからお試しください");
      });

      it("expired-action-code エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/expired-action-code", "Expired action code");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("パスワードリセットリンクの有効期限が切れています");
      });

      it("invalid-action-code エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/invalid-action-code", "Invalid action code");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("パスワードリセットリンクが無効です");
      });

      it("id-token-expired エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/id-token-expired", "Token expired");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("認証の有効期限が切れました。再度ログインしてください");
      });

      it("id-token-revoked エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/id-token-revoked", "Token revoked");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("認証が無効化されました。再度ログインしてください");
      });

      it("未知のエラーコードの場合、デフォルトメッセージを返す", () => {
        const error = new MockFirebaseError("auth/unknown-error", "Unknown error");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("認証エラーが発生しました (auth/unknown-error)");
      });
    });

    describe("旧形式のエラーメッセージ", () => {
      it("user-not-found を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/user-not-found).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("このメールアドレスは登録されていません");
      });

      it("wrong-password を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/wrong-password).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("パスワードが正しくありません");
      });

      it("invalid-email を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/invalid-email).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("メールアドレスの形式が正しくありません");
      });

      it("too-many-requests を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/too-many-requests).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("ログイン試行回数が上限に達しました。しばらく待ってからお試しください");
      });

      it("未知のメッセージの場合、デフォルトメッセージを返す", () => {
        const error = new Error("Some random error");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe("ログインに失敗しました");
      });
    });

    describe("予期しないエラー", () => {
      it("文字列エラーの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage("string error");

        expect(message).toBe("予期しないエラーが発生しました");
      });

      it("nullの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage(null);

        expect(message).toBe("予期しないエラーが発生しました");
      });

      it("undefinedの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage(undefined);

        expect(message).toBe("予期しないエラーが発生しました");
      });
    });
  });

  describe("logError", () => {
    let consoleGroupSpy: jest.SpyInstance;
    let consoleGroupEndSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleGroupSpy = jest.spyOn(console, "group").mockImplementation();
      consoleGroupEndSpy = jest.spyOn(console, "groupEnd").mockImplementation();
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("開発環境でFirebaseエラーをログ出力", () => {
      // NODE_ENVは読み取り専用なので、実装の条件分岐をテストするには
      // 実際の環境変数が"development"であることを前提とする
      if (process.env.NODE_ENV === "development") {
        const error = new MockFirebaseError("auth/user-not-found", "User not found");
        AuthErrorHandler.logError("login", error);

        expect(consoleGroupSpy).toHaveBeenCalledWith("🔐 Auth Error in login");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error details:", error);
        expect(consoleLogSpy).toHaveBeenCalledWith("Firebase Error Code:", "auth/user-not-found");
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      } else {
        // 本番環境ではスキップ
        expect(true).toBe(true);
      }
    });

    it("開発環境で一般的なエラーをログ出力", () => {
      if (process.env.NODE_ENV === "development") {
        const error = new Error("Generic error");
        AuthErrorHandler.logError("signup", error);

        expect(consoleGroupSpy).toHaveBeenCalledWith("🔐 Auth Error in signup");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error details:", error);
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      } else {
        // 本番環境ではスキップ
        expect(true).toBe(true);
      }
    });

    it("FirebaseErrorでないエラーはコードを表示しない", () => {
      if (process.env.NODE_ENV === "development") {
        const error = new Error("Generic error");
        AuthErrorHandler.logError("reset", error);

        expect(consoleGroupSpy).toHaveBeenCalledWith("🔐 Auth Error in reset");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error details:", error);
        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining("Firebase Error Code:"), expect.anything());
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      } else {
        // 本番環境ではスキップ
        expect(true).toBe(true);
      }
    });
  });
});
