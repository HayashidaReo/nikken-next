import { NextRequest, NextResponse } from "next/server";
import { getAdminTeamRepository } from "@/lib/di";
import { TeamFormConverter } from "@/lib/converters/team-form-converter";
import type {
    TeamFormData,
    TeamFormWithParams,
} from "@/types/team-form.schema";
import { teamFormSchema } from "@/types/team-form.schema";

/**
 * 選手登録API Route
 * POST /api/teams/register
 */
export async function POST(request: NextRequest) {
    try {
        // リクエストボディの取得と検証
        const body: TeamFormWithParams = await request.json();
        const { orgId, tournamentId, ...formData } = body;

        if (!orgId || !tournamentId) {
            return NextResponse.json(
                { error: "orgIdおよびtournamentIdは必須です" },
                { status: 400 }
            );
        }
        // 入力データの検証（Zod スキーマで厳密に検証）
        const parsed = teamFormSchema.safeParse(formData);
        if (!parsed.success) {
            const details = parsed.error.issues.map(i => i.message);
            return NextResponse.json(
                {
                    error: "入力データが無効です",
                    details,
                },
                { status: 400 }
            );
        }

        // TeamFormData を TeamCreate に変換
        const teamCreate = TeamFormConverter.toTeamCreate(formData as TeamFormData);

        // サーバーサイドでFirestoreに保存

        const adminRepository = getAdminTeamRepository();
        const savedTeam = await adminRepository.create(
            orgId,
            tournamentId,
            teamCreate
        );

        return NextResponse.json({
            success: true,
            team: {
                id: savedTeam.teamId,
                name: savedTeam.teamName,
                representativeName: savedTeam.representativeName,
                playersCount: savedTeam.players.length,
                isApproved: savedTeam.isApproved,
                createdAt: savedTeam.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error("Team registration error:", error);

        return NextResponse.json(
            {
                error: "チーム登録に失敗しました",
                details:
                    error instanceof Error ? error.message : "不明なエラーが発生しました",
            },
            { status: 500 }
        );
    }
}

/**
 * OPTIONS ハンドラー（CORS対応）
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
