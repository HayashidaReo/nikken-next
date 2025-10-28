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
        console.log("=== Tournament API Debug Start ===");
        console.log("Raw params (before await):", params);
        console.log("Raw request URL:", request.url);

        const paramsResolved = await params;
        orgId = paramsResolved.orgId;

        console.log("Resolved orgId:", orgId);
        console.log("Type of orgId:", typeof orgId);
        console.log("Length of orgId:", orgId?.length);

        if (!orgId || typeof orgId !== 'string' || orgId.trim() === '') {
            console.log("❌ Invalid orgId - validation failed");
            console.log("Validation details:");
            console.log("  - !orgId:", !orgId);
            console.log("  - typeof orgId !== 'string':", typeof orgId !== 'string');
            console.log("  - orgId.trim() === '':", orgId?.trim() === '');
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

        console.log("✅ Fetching tournaments for orgId:", orgId);

        // まず組織が存在するか確認
        console.log("Checking if organization exists:", orgId);
        const orgDoc = await adminDb
            .collection("organizations")
            .doc(orgId)
            .get();

        console.log("Organization document exists:", orgDoc.exists);
        if (orgDoc.exists) {
            console.log("Organization data:", orgDoc.data());
        }

        if (!orgDoc.exists) {
            console.log("Organization not found:", orgId);
            return NextResponse.json(
                {
                    error: "指定された組織が見つかりません",
                    details: `組織ID: ${orgId} が存在しません。組織を作成してください。`
                },
                { status: 404 }
            );
        }

        console.log("Organization exists, fetching tournaments");

        // Firestoreから組織内の全大会を取得
        const tournamentsSnapshot = await adminDb
            .collection("organizations")
            .doc(orgId)
            .collection("tournaments")
            .orderBy("createdAt", "desc")
            .get();

        console.log("Found tournaments count:", tournamentsSnapshot.docs.length);

        const tournaments = tournamentsSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Tournament raw data:", data);
            return {
                tournamentId: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate().toISOString(),
                updatedAt: data.updatedAt?.toDate().toISOString(),
            };
        });

        console.log("Processed tournaments:", tournaments);

        return NextResponse.json({ tournaments });

    } catch (error) {
        console.error("❌ Tournaments fetch error:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
        console.error("Params orgId:", orgId);

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