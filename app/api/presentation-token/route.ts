import { NextRequest, NextResponse } from "next/server";
import { generatePresentationToken } from "@/services/presentation-token-service";

/**
 * プレゼンテーショントークン生成API
 * モニター表示画面用の一時的なアクセストークンを発行する
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // TODO: 認証チェックを実装する
        // 現状は全てのリクエストを受け付けるが、本番環境ではユーザーセッションを検証すること
        // Example: const session = await getServerSession(authOptions);
        // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // リクエストボディからパラメータを取得
        const body = await request.json();
        const { matchId, orgId, tournamentId } = body;

        // サービス層でトークンを生成
        const result = generatePresentationToken({ matchId, orgId, tournamentId });

        // トークン発行のログ出力（監査証跡として）
        const duration = Date.now() - startTime;
        console.log("[PresentationToken] Token issued", {
            matchId,
            orgId,
            tournamentId,
            expiresAt: new Date(result.expiresAt).toISOString(),
            duration: `${duration}ms`,
        });

        return NextResponse.json(result);
    } catch (error) {
        const duration = Date.now() - startTime;

        // バリデーションエラーのハンドリング
        if (error instanceof Error) {
            console.warn("[PresentationToken] Token generation error:", {
                message: error.message,
                duration: `${duration}ms`,
            });
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        // 予期しないエラーのハンドリング
        console.error("[PresentationToken] Unexpected error:", error, {
            duration: `${duration}ms`,
        });
        return NextResponse.json(
            { error: "Failed to generate presentation token" },
            { status: 500 }
        );
    }
}
