/**
 * @jest-environment node
 */

import { ApiError, createApiError } from "./api-error";

describe("ApiError", () => {
    describe("コンストラクタ", () => {
        it("エラーメッセージ、ステータス、コードで初期化される", () => {
            const error = new ApiError("Test error", 404, "NOT_FOUND");

            expect(error.message).toBe("Test error");
            expect(error.status).toBe(404);
            expect(error.code).toBe("NOT_FOUND");
            expect(error.name).toBe("ApiError");
        });

        it("コードなしで初期化できる", () => {
            const error = new ApiError("Test error", 500);

            expect(error.message).toBe("Test error");
            expect(error.status).toBe(500);
            expect(error.code).toBeUndefined();
        });
    });

    describe("isNotFound", () => {
        it("ステータスが404の場合、trueを返す", () => {
            const error = new ApiError("Not found", 404);
            expect(error.isNotFound()).toBe(true);
        });

        it("ステータスが404以外の場合、falseを返す", () => {
            const error = new ApiError("Server error", 500);
            expect(error.isNotFound()).toBe(false);
        });

        it("ステータスが400の場合、falseを返す", () => {
            const error = new ApiError("Bad request", 400);
            expect(error.isNotFound()).toBe(false);
        });
    });

    describe("isBadRequest", () => {
        it("ステータスが400の場合、trueを返す", () => {
            const error = new ApiError("Bad request", 400);
            expect(error.isBadRequest()).toBe(true);
        });

        it("ステータスが400以外の場合、falseを返す", () => {
            const error = new ApiError("Not found", 404);
            expect(error.isBadRequest()).toBe(false);
        });

        it("ステータスが500の場合、falseを返す", () => {
            const error = new ApiError("Server error", 500);
            expect(error.isBadRequest()).toBe(false);
        });
    });

    describe("isServerError", () => {
        it("ステータスが500以上の場合、trueを返す", () => {
            expect(new ApiError("Server error", 500).isServerError()).toBe(true);
            expect(new ApiError("Service unavailable", 503).isServerError()).toBe(true);
            expect(new ApiError("Gateway error", 502).isServerError()).toBe(true);
        });

        it("ステータスが500未満の場合、falseを返す", () => {
            expect(new ApiError("Bad request", 400).isServerError()).toBe(false);
            expect(new ApiError("Not found", 404).isServerError()).toBe(false);
            expect(new ApiError("Unauthorized", 401).isServerError()).toBe(false);
        });

        it("ステータスが499の場合、falseを返す", () => {
            const error = new ApiError("Client error", 499);
            expect(error.isServerError()).toBe(false);
        });
    });
});

describe("createApiError", () => {
    it("JSONボディからエラーを作成", async () => {
        const mockResponse = new Response(
            JSON.stringify({ error: "Resource not found", code: "NOT_FOUND" }),
            { status: 404 }
        );

        const error = await createApiError(mockResponse);

        expect(error.message).toBe("Resource not found");
        expect(error.status).toBe(404);
        expect(error.code).toBe("NOT_FOUND");
    });

    it("messageフィールドからエラーを取得", async () => {
        const mockResponse = new Response(
            JSON.stringify({ message: "Invalid request" }),
            { status: 400 }
        );

        const error = await createApiError(mockResponse);

        expect(error.message).toBe("Invalid request");
        expect(error.status).toBe(400);
    });

    it("JSONパースに失敗した場合、HTTPステータスをメッセージに使用", async () => {
        const mockResponse = new Response("Invalid JSON", { status: 500 });

        const error = await createApiError(mockResponse);

        expect(error.message).toContain("HTTPエラー: 500");
        expect(error.status).toBe(500);
    });

    it("エラーフィールドもmessageフィールドもない場合、デフォルトメッセージを使用", async () => {
        const mockResponse = new Response(
            JSON.stringify({}),
            { status: 403 }
        );

        const error = await createApiError(mockResponse);

        expect(error.message).toBe("APIエラーが発生しました");
        expect(error.status).toBe(403);
    });

    it("複数エラーの異なるステータスコード", async () => {
        const testCases = [
            { status: 401, message: "Unauthorized" },
            { status: 403, message: "Forbidden" },
            { status: 500, message: "Internal Server Error" },
            { status: 503, message: "Service Unavailable" },
        ];

        for (const testCase of testCases) {
            const mockResponse = new Response(
                JSON.stringify({ error: testCase.message }),
                { status: testCase.status }
            );

            const error = await createApiError(mockResponse);

            expect(error.status).toBe(testCase.status);
            expect(error.message).toBe(testCase.message);
        }
    });

    it("codeフィールドが含まれない場合、undefinedになる", async () => {
        const mockResponse = new Response(
            JSON.stringify({ error: "Bad request" }),
            { status: 400 }
        );

        const error = await createApiError(mockResponse);

        expect(error.code).toBeUndefined();
    });
});
