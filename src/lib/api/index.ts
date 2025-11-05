import { NextResponse } from "next/server";

/**
 * 共通のエラーレスポンスを生成するヘルパー関数
 */
export function createErrorResponse(
    error: unknown,
    defaultMessage: string,
    status: number = 500
): NextResponse {
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました";

    return NextResponse.json(
        {
            error: defaultMessage,
            details: errorMessage,
        },
        { status }
    );
}

/**
 * Firebase Auth の特定エラーをチェックしてカスタムレスポンスを生成
 */
export function handleFirebaseAuthError(error: unknown): NextResponse | null {
    if (error instanceof Error) {
        if (error.message.includes("email-already-exists")) {
            return NextResponse.json(
                { error: "指定されたメールアドレスは既に使用されています" },
                { status: 400 }
            );
        }

        if (error.message.includes("id-token-expired")) {
            return NextResponse.json(
                { error: "認証トークンが期限切れです" },
                { status: 401 }
            );
        }

        if (error.message.includes("id-token-invalid")) {
            return NextResponse.json(
                { error: "認証トークンが無効です" },
                { status: 401 }
            );
        }
    }

    return null;
}

/**
 * バリデーションエラーレスポンスを生成
 */
export function createValidationErrorResponse(validationError: { issues: Array<{ message: string }> }): NextResponse {
    return NextResponse.json(
        {
            error: "入力データが無効です",
            details: validationError.issues.map(e => e.message),
        },
        { status: 400 }
    );
}
