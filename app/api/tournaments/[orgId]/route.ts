import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/server";

/**
 * 組織内の大会一覧取得API Route
 * GET /api/tournaments/[orgId]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { orgId: string } }
) {
    try {
        // TODO: 認証チェック実装

        const { orgId } = params;

        // Firestoreから組織内の全大会を取得
        const tournamentsSnapshot = await adminDb
            .collection("organizations")
            .doc(orgId)
            .collection("tournaments")
            .orderBy("createdAt", "desc")
            .get();

        const tournaments = tournamentsSnapshot.docs.map(doc => ({
            tournamentId: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        }));

        return NextResponse.json({ tournaments });

    } catch (error) {
        console.error("Tournaments fetch error:", error);

        return NextResponse.json(
            {
                error: "大会一覧の取得に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました"
            },
            { status: 500 }
        );
    }
}