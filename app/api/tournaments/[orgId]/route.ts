import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/server";

/**
 * 組織内の大会一覧取得API Route
 * GET /api/tournaments/[orgId]
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    let orgId: string | undefined;

    try {
        const paramsResolved = await params;
        orgId = paramsResolved.orgId;

        if (!orgId || typeof orgId !== 'string' || orgId.trim() === '') {
            return Response.json(
                { error: '組織IDが無効です' },
                { status: 400 }
            );
        }

        // TODO: 認証チェック実装

        // Firebase Admin DB の初期化チェック
        if (!adminDb) {
            throw new Error("Firebase Admin DB が初期化されていません");
        }

        // まず組織が存在するか確認
        const orgDoc = await adminDb
            .collection("organizations")
            .doc(orgId)
            .get();

        if (!orgDoc.exists) {
            return NextResponse.json(
                {
                    error: "指定された組織が見つかりません",
                    details: `組織ID: ${orgId} が存在しません。組織を作成してください。`
                },
                { status: 404 }
            );
        }                // 大会一覧を取得
        const tournamentsRef = adminDb
            .collection("organizations")
            .doc(orgId)
            .collection("tournaments");

        const snapshot = await tournamentsRef.get();

        const tournaments = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
            };
        });

        return NextResponse.json({
            success: true,
            data: tournaments,
        });

    } catch (error) {
        return NextResponse.json(
            {
                error: "大会一覧の取得に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました",
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
            },
            { status: 500 }
        );
    }
}