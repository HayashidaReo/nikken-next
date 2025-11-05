/**
 * @jest-environment node
 */

import {
    createErrorResponse,
    handleFirebaseAuthError,
    createValidationErrorResponse,
    createNotFoundResponse,
} from "./api-helpers";

// NextResponseのモック
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn((body: unknown, init?: ResponseInit) => ({
            status: init?.status || 200,
            json: async () => body,
        })),
    },
}));

describe("API Helpers", () => {
    describe("createErrorResponse", () => {
        it("Error オブジェクトからエラーメッセージを抽出", async () => {
            const error = new Error("Database connection failed");
            const response = createErrorResponse(error, "データベースエラー", 500);

            expect(response.status).toBe(500);

            const json = await response.json();
            expect(json.error).toBe("データベースエラー");
            expect(json.details).toBe("Database connection failed");
        });

        it("Error オブジェクト以外の場合、デフォルトメッセージを使用", async () => {
            const error = "string error";
            const response = createErrorResponse(error, "予期しないエラー", 500);

            const json = await response.json();
            expect(json.error).toBe("予期しないエラー");
            expect(json.details).toBe("不明なエラーが発生しました");
            expect(response.status).toBe(500);
        });

        it("カスタムステータスコードを設定可能", () => {
            const error = new Error("Bad request");
            const response = createErrorResponse(error, "無効なリクエスト", 400);

            expect(response.status).toBe(400);
        });

        it("ステータスコード未指定の場合、500を返す", () => {
            const error = new Error("Internal error");
            const response = createErrorResponse(error, "内部エラー");

            expect(response.status).toBe(500);
        });

        it("null エラーの場合、デフォルトメッセージを使用", async () => {
            const error = null;
            const response = createErrorResponse(error, "エラーが発生しました", 500);

            const json = await response.json();
            expect(json.error).toBe("エラーが発生しました");
            expect(json.details).toBe("不明なエラーが発生しました");
        });

        it("undefined エラーの場合、デフォルトメッセージを使用", async () => {
            const error = undefined;
            const response = createErrorResponse(error, "エラーが発生しました", 500);

            const json = await response.json();
            expect(json.error).toBe("エラーが発生しました");
            expect(json.details).toBe("不明なエラーが発生しました");
        });
    });

    describe("handleFirebaseAuthError", () => {
        it("email-already-exists エラーをハンドリング", async () => {
            const error = new Error("Firebase: Error (auth/email-already-exists)");
            const response = handleFirebaseAuthError(error);

            expect(response).not.toBeNull();
            expect(response?.status).toBe(400);

            const json = await response!.json();
            expect(json.error).toBe("指定されたメールアドレスは既に使用されています");
        });

        it("id-token-expired エラーをハンドリング", async () => {
            const error = new Error("Firebase: Error (auth/id-token-expired)");
            const response = handleFirebaseAuthError(error);

            expect(response).not.toBeNull();
            expect(response?.status).toBe(401);

            const json = await response!.json();
            expect(json.error).toBe("認証トークンが期限切れです");
        });

        it("id-token-invalid エラーをハンドリング", async () => {
            const error = new Error("Firebase: Error (auth/id-token-invalid)");
            const response = handleFirebaseAuthError(error);

            expect(response).not.toBeNull();
            expect(response?.status).toBe(401);

            const json = await response!.json();
            expect(json.error).toBe("認証トークンが無効です");
        });

        it("Firebase Auth エラーでない場合、null を返す", () => {
            const error = new Error("Generic error");
            const response = handleFirebaseAuthError(error);

            expect(response).toBeNull();
        });

        it("Error オブジェクトでない場合、null を返す", () => {
            const error = "string error";
            const response = handleFirebaseAuthError(error);

            expect(response).toBeNull();
        });

        it("null エラーの場合、null を返す", () => {
            const error = null;
            const response = handleFirebaseAuthError(error);

            expect(response).toBeNull();
        });

        it("undefined エラーの場合、null を返す", () => {
            const error = undefined;
            const response = handleFirebaseAuthError(error);

            expect(response).toBeNull();
        });
    });

    describe("createValidationErrorResponse", () => {
        it("単一のバリデーションエラーをフォーマット", async () => {
            const validationError = {
                issues: [{ message: "メールアドレスは必須です" }],
            };

            const response = createValidationErrorResponse(validationError);

            expect(response.status).toBe(400);

            const json = await response.json();
            expect(json.error).toBe("入力データが無効です");
            expect(json.details).toEqual(["メールアドレスは必須です"]);
        });

        it("複数のバリデーションエラーをフォーマット", async () => {
            const validationError = {
                issues: [
                    { message: "メールアドレスは必須です" },
                    { message: "パスワードは6文字以上である必要があります" },
                    { message: "名前は必須です" },
                ],
            };

            const response = createValidationErrorResponse(validationError);

            expect(response.status).toBe(400);

            const json = await response.json();
            expect(json.error).toBe("入力データが無効です");
            expect(json.details).toEqual([
                "メールアドレスは必須です",
                "パスワードは6文字以上である必要があります",
                "名前は必須です",
            ]);
        });

        it("空のバリデーションエラー配列を処理", async () => {
            const validationError = {
                issues: [],
            };

            const response = createValidationErrorResponse(validationError);

            expect(response.status).toBe(400);

            const json = await response.json();
            expect(json.error).toBe("入力データが無効です");
            expect(json.details).toEqual([]);
        });
    });

    describe("createNotFoundResponse", () => {
        it("リソース名を含む404レスポンスを生成", async () => {
            const response = createNotFoundResponse("大会");

            expect(response.status).toBe(404);

            const json = await response.json();
            expect(json.error).toBe("大会が見つかりません");
        });

        it("チーム用の404レスポンスを生成", async () => {
            const response = createNotFoundResponse("チーム");

            expect(response.status).toBe(404);

            const json = await response.json();
            expect(json.error).toBe("チームが見つかりません");
        });

        it("組織用の404レスポンスを生成", async () => {
            const response = createNotFoundResponse("組織");

            expect(response.status).toBe(404);

            const json = await response.json();
            expect(json.error).toBe("組織が見つかりません");
        });

        it("試合用の404レスポンスを生成", async () => {
            const response = createNotFoundResponse("試合");

            expect(response.status).toBe(404);

            const json = await response.json();
            expect(json.error).toBe("試合が見つかりません");
        });
    });
});
