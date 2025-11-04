import { NextRequest, NextResponse } from "next/server";
import { AdminMatchRepositoryImpl } from "@/repositories/admin/match-repository";
import { z } from "zod";

// 部分更新用のスキーマ
const MatchUpdateRequestSchema = z.object({
    organizationId: z.string(),
    tournamentId: z.string(),
    players: z.object({
        playerA: z.object({
            score: z.number().min(0).max(2),
            hansoku: z.number().min(0).max(4),
        }),
        playerB: z.object({
            score: z.number().min(0).max(2),
            hansoku: z.number().min(0).max(4),
        }),
    }),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ matchId: string }> }
) {
    try {
        const { matchId } = await params;
        const body = await request.json();

        // リクエストボディの検証
        const validatedData = MatchUpdateRequestSchema.parse(body);

        const matchRepository = new AdminMatchRepositoryImpl();

        // 既存の試合を取得
        const existingMatch = await matchRepository.getById(
            validatedData.organizationId,
            validatedData.tournamentId,
            matchId
        );

        if (!existingMatch) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }

        // 部分更新データを作成
        const updateData = {
            players: {
                playerA: {
                    ...existingMatch.players.playerA,
                    score: validatedData.players.playerA.score,
                    hansoku: validatedData.players.playerA.hansoku,
                },
                playerB: {
                    ...existingMatch.players.playerB,
                    score: validatedData.players.playerB.score,
                    hansoku: validatedData.players.playerB.hansoku,
                },
            },
        };

        // マッチを更新
        const updatedMatch = await matchRepository.update(
            validatedData.organizationId,
            validatedData.tournamentId,
            matchId,
            updateData
        );

        return NextResponse.json(updatedMatch);
    } catch (error) {
        console.error("Failed to update match:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}