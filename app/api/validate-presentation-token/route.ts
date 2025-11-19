import { NextRequest, NextResponse } from "next/server";
import { validatePresentationToken, TokenValidationError } from "@/services/presentation-token-service";

/**
 * プレゼンテーショントークン検証API
 * モニター表示画面用のトークンが有効かどうかを検証する
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    try {
        // Authorizationヘッダーまたはボディからトークンを抽出
        const authHeader = request.headers.get("authorization");
        let token: string | null = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            // Bearerトークン形式
            token = authHeader.substring(7);
        } else {
            // ボディからトークンを取得
            const body = await request.json();
            token = body.token;
        }

        // トークンの存在チェック
        if (!token) {
            console.warn("[TokenValidation] Token not provided", { clientIp });
            return NextResponse.json(
                { error: "Token not provided" },
                { status: 401 }
            );
        }

        // サービス層でトークンを検証
        const result = validatePresentationToken(token);

        const duration = Date.now() - startTime;

        // 検証成功のログ出力
        console.log("[TokenValidation] Token validated successfully", {
            matchId: result.matchId,
            orgId: result.orgId,
            tournamentId: result.tournamentId,
            clientIp,
            duration: `${duration}ms`,
        });

        return NextResponse.json(result);
    } catch (error) {
        const duration = Date.now() - startTime;

        // トークン検証エラーのハンドリング
        if (error instanceof TokenValidationError) {
            const status = error.code === "EXPIRED" || error.code === "INVALID" ? 401 : 403;
            console.warn("[TokenValidation] Token validation error:", {
                code: error.code,
                message: error.message,
                clientIp,
                duration: `${duration}ms`,
            });
            return NextResponse.json(
                { error: error.message },
                { status }
            );
        }

        // 予期しないエラーのハンドリング
        console.error("[TokenValidation] Unexpected error:", error, {
            clientIp,
            duration: `${duration}ms`,
        });
        return NextResponse.json(
            { error: "Token validation failed" },
            { status: 500 }
        );
    }
}


