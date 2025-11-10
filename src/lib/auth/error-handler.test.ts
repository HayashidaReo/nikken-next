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
import { TEXT_MESSAGES } from "@/lib/constants";

// テスト用にモックされたFirebaseErrorを取得
const MockFirebaseError = FirebaseError as unknown as new (code: string, message: string) => Error & { code: string };

describe("AuthErrorHandler", () => {
  describe("getErrorMessage", () => {
    describe("Firebase エラーコードのマッピング", () => {
      it("user-not-found エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/user-not-found", "User not found");
        const message = AuthErrorHandler.getErrorMessage(error);

        // 実装ではユーザー不在とパスワード誤りはセキュリティ上同一メッセージにまとめられる
        expect(message).toBe(TEXT_MESSAGES.INVALID_CREDENTIALS);
      });

      it("wrong-password エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/wrong-password", "Wrong password");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.INVALID_CREDENTIALS);
      });

      it("invalid-email エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/invalid-email", "Invalid email");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.INVALID_EMAIL);
      });

      it("user-disabled エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/user-disabled", "User disabled");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.USER_DISABLED);
      });

      it("email-already-in-use エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/email-already-in-use", "Email already in use");
        const message = AuthErrorHandler.getErrorMessage(error);

        // 現在の実装では email-already-in-use は明示的にマッピングしていないため Unexcepted になる
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("too-many-requests エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/too-many-requests", "Too many requests");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.TOO_MANY_REQUESTS);
      });

      it("weak-password エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/weak-password", "Weak password");
        const message = AuthErrorHandler.getErrorMessage(error);

        // weak-password は未マッピングのためデフォルトエラー
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("network-request-failed エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/network-request-failed", "Network error");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.NETWORK_ERROR);
      });

      it("internal-error エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/internal-error", "Internal error");
        const message = AuthErrorHandler.getErrorMessage(error);

        // internal-error は現在予期しないエラーとして扱われる
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("expired-action-code エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/expired-action-code", "Expired action code");
        const message = AuthErrorHandler.getErrorMessage(error);

        // expired/invalid action code は未マッピングのためデフォルト
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("invalid-action-code エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/invalid-action-code", "Invalid action code");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("id-token-expired エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/id-token-expired", "Token expired");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("id-token-revoked エラーを日本語に変換", () => {
        const error = new MockFirebaseError("auth/id-token-revoked", "Token revoked");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("未知のエラーコードの場合、デフォルトメッセージを返す", () => {
        const error = new MockFirebaseError("auth/unknown-error", "Unknown error");
        const message = AuthErrorHandler.getErrorMessage(error);

        // 未知のコードは予期しないエラーに落とす実装
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });
    });

    describe("旧形式のエラーメッセージ", () => {
      it("user-not-found を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/user-not-found).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.INVALID_CREDENTIALS);
      });

      it("wrong-password を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/wrong-password).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.INVALID_CREDENTIALS);
      });

      it("invalid-email を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/invalid-email).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.INVALID_EMAIL);
      });

      it("too-many-requests を含むメッセージを変換", () => {
        const error = new Error("Firebase: Error (auth/too-many-requests).");
        const message = AuthErrorHandler.getErrorMessage(error);

        expect(message).toBe(TEXT_MESSAGES.TOO_MANY_REQUESTS);
      });

      it("未知のメッセージの場合、デフォルトメッセージを返す", () => {
        const error = new Error("Some random error");
        const message = AuthErrorHandler.getErrorMessage(error);

        // 旧メッセージで判別できない場合はデフォルトの予期しないエラー
        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });
    });
    describe("予期しないエラー", () => {
      it("文字列エラーの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage("string error");

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("nullの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage(null);

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });

      it("undefinedの場合、デフォルトメッセージを返す", () => {
        const message = AuthErrorHandler.getErrorMessage(undefined);

        expect(message).toBe(TEXT_MESSAGES.UNEXPECTED_ERROR);
      });
    });
  });
});
