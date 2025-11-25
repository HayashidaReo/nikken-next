import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/server";
import { Timestamp } from "firebase-admin/firestore";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";
import { tournamentSchema } from "@/types/tournament.schema";
import { z } from "zod";

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
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
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

    // Zodスキーマで部分的にバリデーション（更新なので全フィールド必須ではない）
    let validatedData;
    try {
      validatedData = tournamentSchema.partial().parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues[0]?.message || "入力データが不正です";
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      return NextResponse.json({ error: "入力データが不正です" }, { status: 400 });
    }

    // createdAt/updatedAt/tournamentIdをvalidatedDataから除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, tournamentId: _tid, ...bodyData } = validatedData;

    // 更新データの準備（updatedAtはサーバー側で生成）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...bodyData,
      updatedAt: Timestamp.now(), // サーバー側で生成
    };

    // tournamentDateはz.coerce.date()により既にDateオブジェクト
    if (updateData.tournamentDate) {
      updateData.tournamentDate = Timestamp.fromDate(updateData.tournamentDate);
    }

    // Firestoreの大会ドキュメントを更新（存在しない場合は作成）
    await adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "大会情報を更新しました",
    });
  } catch (error) {
    console.error("Tournament update error:", error);

    return NextResponse.json(
      {
        error: "大会情報の更新に失敗しました",
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

/**
 * 大会削除API Route
 * DELETE /api/tournaments/[orgId]/[tournamentId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; tournamentId: string }> }
) {
  try {
    // TODO: 認証チェック実装

    const { orgId, tournamentId } = await params;

    // パラメータのバリデーション
    if (!orgId || !tournamentId) {
      return NextResponse.json(
        { error: "組織IDまたは大会IDが指定されていません" },
        { status: 400 }
      );
    }

    // 大会ドキュメントが存在するか確認
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

    // 大会ドキュメントを削除
    await adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .delete();

    return NextResponse.json({
      success: true,
      message: "大会を削除しました",
    });
  } catch (error) {
    console.error("Tournament delete error:", error);

    return NextResponse.json(
      {
        error: "大会の削除に失敗しました",
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
