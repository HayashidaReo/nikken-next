import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/server";
import { Timestamp } from "firebase-admin/firestore";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

/**
 * 大会情報取得API Route
 * GET /api/tournaments/[orgId]/[tournamentId]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string; tournamentId: string }> }
) {
    try {
        // TODO: 認証チェック実装
        // const token = request.headers.get("Authorization");
        // if (!token) {
        //   return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
        // }

        const { orgId, tournamentId } = await params;

        // Firestoreから大会データを取得
        const tournamentDoc = await adminDb
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
            .get();

        if (!tournamentDoc.exists) {
            return NextResponse.json(
                { error: "大会が見つかりません" },
                { status: 404 }
            );
        }

        const tournamentData = tournamentDoc.data();

        if (!tournamentData) {
            return NextResponse.json(
                { error: "大会データが空です" },
                { status: 404 }
            );
        }

        // TimestampをISOStringに変換
        const tournament = {
            tournamentId: tournamentDoc.id,
            ...tournamentData,
            tournamentDate: tournamentData?.tournamentDate?.toDate().toISOString(),
            createdAt: tournamentData?.createdAt?.toDate().toISOString(),
            updatedAt: tournamentData?.updatedAt?.toDate().toISOString(),
        };

        return NextResponse.json({ tournament });

    } catch (error) {
        console.error("Tournament fetch error:", error);

        return NextResponse.json(
            {
                error: "大会情報の取得に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました"
            },
            { status: 500 }
        );
    }
}

/**
 * 大会情報更新API Route
 * PUT /api/tournaments/[orgId]/[tournamentId]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ orgId: string; tournamentId: string }> }
) {
    try {
        // TODO: 認証チェック実装

        const { orgId, tournamentId } = await params;
        const body = await request.json();

        // パラメータのバリデーション
        if (!orgId || !tournamentId) {
            return NextResponse.json(
                { error: "組織IDまたは大会IDが指定されていません" },
                { status: 400 }
            );
        }

        // 更新データの準備
        const updateData = {
            ...body,
            updatedAt: Timestamp.now(),
        };

        // tournamentDateがDate型の場合の処理
        if (updateData.tournamentDate) {
            if (typeof updateData.tournamentDate === 'string') {
                updateData.tournamentDate = Timestamp.fromDate(new Date(updateData.tournamentDate));
            } else if (updateData.tournamentDate instanceof Date) {
                updateData.tournamentDate = Timestamp.fromDate(updateData.tournamentDate);
            }
        }

        // tournamentIdは更新しない
        delete updateData.tournamentId;
        delete updateData.createdAt;

        // Firestoreの大会ドキュメントを更新
        await adminDb
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
            .update(updateData);

        return NextResponse.json({
            success: true,
            message: "大会情報を更新しました"
        });

    } catch (error) {
        console.error("Tournament update error:", error);

        return NextResponse.json(
            {
                error: "大会情報の更新に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました"
            },
            { status: 500 }
        );
    }
}