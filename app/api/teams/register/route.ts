import { NextRequest, NextResponse } from "next/server";
import { AdminTeamRepository } from "@/repositories/admin/team-repository";
import { PlayerRegistrationConverter } from "@/lib/converters/player-registration-converter";
import type { PlayerRegistrationData } from "@/components/molecules/confirmation-dialog";

/**
 * 選手登録データの型定義（組織ID・大会IDを含む）
 */
interface PlayerRegistrationWithParams extends PlayerRegistrationData {
    orgId?: string;
    tournamentId?: string;
}

/**
 * 選手登録API Route
 * POST /api/teams/register
 */
export async function POST(request: NextRequest) {
    try {
        // リクエストボディの取得と検証
        const body: PlayerRegistrationWithParams = await request.json();
        const { orgId, tournamentId, ...formData } = body;
        
        if (!orgId || !tournamentId) {
            return NextResponse.json(
                { error: "orgIdおよびtournamentIdは必須です" },
                { status: 400 }
            );
        }
        // 入力データの検証
        const validation = PlayerRegistrationConverter.validateFormData(formData as PlayerRegistrationData);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: "入力データが無効です",
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        // PlayerRegistrationData を TeamCreate に変換
        const teamCreate = PlayerRegistrationConverter.toTeamCreate(formData as PlayerRegistrationData);

        // サーバーサイドでFirestoreに保存

        const adminRepository = new AdminTeamRepository();
        const savedTeam = await adminRepository.createWithParams(teamCreate, orgId, tournamentId);

        return NextResponse.json({
            success: true,
            team: {
                id: savedTeam.teamId,
                name: savedTeam.teamName,
                representativeName: savedTeam.representativeName,
                playersCount: savedTeam.players.length,
                isApproved: savedTeam.isApproved,
                createdAt: savedTeam.createdAt.toISOString(),
            }
        });

    } catch (error) {
        console.error("Team registration error:", error);

        return NextResponse.json(
            {
                error: "チーム登録に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました"
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}