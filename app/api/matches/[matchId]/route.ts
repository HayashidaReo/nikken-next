import { NextRequest, NextResponse } from "next/server";
import { AdminMatchRepositoryImpl } from "@/repositories/admin/match-repository";
import { createErrorResponse, createValidationErrorResponse, createNotFoundResponse } from "@/lib/api-helpers";
import { matchUpdateRequestSchema } from "@/types/match.schema";
import { z } from "zod";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ matchId: string }> }
) {
    try {
        const { matchId } = await params;
        const body = await request.json();

        // リクエストボディの検証
        const validatedData = matchUpdateRequestSchema.parse(body);

        const matchRepository = new AdminMatchRepositoryImpl();

        // 既存の試合を取得
        const existingMatch = await matchRepository.getById(
            validatedData.organizationId,
            validatedData.tournamentId,
            matchId
        );

        if (!existingMatch) {
            return createNotFoundResponse("試合");
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
            return createValidationErrorResponse(error);
        }

        return createErrorResponse(error, "試合結果の更新に失敗しました", 500);
    }
}