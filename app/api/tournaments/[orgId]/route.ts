import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/server";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

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
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
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
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS);

        const snapshot = await tournamentsRef.get();

        const tournaments = snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
                tournamentDate: data.tournamentDate?.toDate?.() || null,
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

/**
 * 大会新規作成API Route
 * POST /api/tournaments/[orgId]
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ orgId: string }> }
) {
    let orgId: string | undefined;

    try {
        const paramsResolved = await params;
        orgId = paramsResolved.orgId;

        if (!orgId || typeof orgId !== 'string' || orgId.trim() === '') {
            return NextResponse.json(
                { error: '組織IDが無効です' },
                { status: 400 }
            );
        }

        // TODO: 認証チェック実装

        // リクエストボディを取得
        const body = await request.json();

        const {
            name,
            tournamentName = name, // nameフィールドも受け入れる
            tournamentDate,
            tournamentDetail,
            location,
            defaultMatchTime,
            courts
        } = body;

        // バリデーション
        if (!tournamentName || typeof tournamentName !== 'string' || tournamentName.trim() === '') {
            return NextResponse.json(
                { error: '大会名は必須です' },
                { status: 400 }
            );
        }

        // Firebase Admin DB の初期化チェック
        if (!adminDb) {
            throw new Error("Firebase Admin DB が初期化されていません");
        }

        // 組織が存在するか確認
        const orgDoc = await adminDb
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .get();

        if (!orgDoc.exists) {
            return NextResponse.json(
                {
                    error: "指定された組織が見つかりません",
                    details: `組織ID: ${orgId} が存在しません。`
                },
                { status: 404 }
            );
        }

        // 大会データを作成
        const now = new Date();
        // tournamentDateがDate型の場合の処理
        let parsedTournamentDate = now;
        if (tournamentDate) {
            if (typeof tournamentDate === 'string') {
                parsedTournamentDate = new Date(tournamentDate);
            } else if (tournamentDate instanceof Date) {
                parsedTournamentDate = tournamentDate;
            }
        }

        const tournamentData = {
            tournamentName: tournamentName.trim(),
            tournamentDate: parsedTournamentDate,
            tournamentDetail: tournamentDetail || '',
            location: location || '',
            defaultMatchTime: typeof defaultMatchTime === 'number' ? defaultMatchTime : 180,
            courts: Array.isArray(courts) ? courts : [],
            createdAt: now,
            updatedAt: now,
        };

        // 大会を作成
        const docRef = await adminDb
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .add(tournamentData);

        // 作成されたドキュメントにtournamentIdを追加保存
        await docRef.update({
            tournamentId: docRef.id
        });

        // 作成された大会データを取得
        const createdDoc = await docRef.get();
        const createdData = createdDoc.data();

        return NextResponse.json({
            success: true,
            data: {
                tournamentId: createdDoc.id,
                ...createdData,
                tournamentDate: createdData?.tournamentDate?.toDate?.() || null,
                createdAt: createdData?.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: createdData?.updatedAt?.toDate?.()?.toISOString() || null,
            }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            {
                error: "大会の作成に失敗しました",
                details: error instanceof Error ? error.message : "不明なエラーが発生しました",
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
            },
            { status: 500 }
        );
    }
}