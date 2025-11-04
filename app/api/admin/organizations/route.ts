import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin/server";
import { organizationCreateWithAccountSchema } from "@/types/organization.schema";
import type { OrganizationCreateWithAccount } from "@/types/organization.schema";
import { Timestamp } from "firebase-admin/firestore";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

/**
 * 組織作成API Route（システム管理者専用）
 * POST /api/admin/organizations
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 実際の認証チェック実装
    // const token = request.headers.get("Authorization");
    // if (!token) {
    //   return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    // }

    // Firebase Admin SDKでトークン検証とシステム管理者権限チェック
    // const decodedToken = await adminAuth.verifyIdToken(token.replace("Bearer ", ""));
    // システム管理者権限は別途実装する（例：Firebase Custom Claims等）
    // if (!decodedToken.admin) {
    //   return NextResponse.json({ error: "システム管理者権限が必要です" }, { status: 403 });
    // }

    // リクエストボディの取得と検証
    const body: OrganizationCreateWithAccount = await request.json();

    // 入力データの検証
    const validation = organizationCreateWithAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validation.error.issues.map(e => e.message),
        },
        { status: 400 }
      );
    }

    const orgData = validation.data;

    // 1. Firebase Authenticationでアカウント作成
    const userRecord = await adminAuth.createUser({
      email: orgData.adminEmail,
      password: orgData.adminPassword,
      displayName: orgData.representativeName,
    });

    // 2. organizationsコレクションに組織情報を保存
    // orgIdとしてユーザーのuidを使用
    const orgId = userRecord.uid;
    const now = Timestamp.now();
    const organizationDoc = {
      orgId: orgId,
      orgName: orgData.orgName,
      representativeName: orgData.representativeName,
      representativePhone: orgData.representativePhone,
      representativeEmail: orgData.representativeEmail,
      adminUid: userRecord.uid, // 管理者のUID
      createdAt: now,
      updatedAt: now,
    };

    const orgRef = adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId); // ユーザーのuidをドキュメントIDとして使用

    // 3. 組織ドキュメントを作成
    await orgRef.set(organizationDoc);

    // 4. デフォルト大会を作成
    const tournamentsCollection = orgRef.collection(FIRESTORE_COLLECTIONS.TOURNAMENTS);
    const tournamentRef = tournamentsCollection.doc(); // ランダムIDを生成
    const tournamentId = tournamentRef.id;

    const defaultTournament = {
      tournamentId: tournamentId,
      tournamentName: "", // 空白で作成
      tournamentDate: "", // 空白で作成
      location: "", // 空白で作成
      defaultMatchTime: 180, // デフォルトで3分（180秒）
      courts: [], // 空配列で作成
      createdAt: now,
      updatedAt: now,
    };

    await tournamentRef.set(defaultTournament);

    return NextResponse.json({
      success: true,
      organization: {
        id: orgId,
        name: orgData.orgName,
        representativeName: orgData.representativeName,
        adminEmail: orgData.adminEmail,
        adminUid: userRecord.uid,
      },
      defaultTournament: {
        id: tournamentId,
        name: "デフォルト大会（設定してください）",
      },
    });
  } catch (error) {
    console.error("Organization creation error:", error);

    // Firebase Auth エラーの詳細処理
    if (error instanceof Error) {
      if (error.message.includes("email-already-exists")) {
        return NextResponse.json(
          { error: "指定されたメールアドレスは既に使用されています" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "組織作成に失敗しました",
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
}

/**
 * 組織一覧取得API Route（システム管理者専用）
 * GET /api/admin/organizations
 */
export async function GET() {
  try {
    // TODO: 認証チェック実装

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .orderBy("createdAt", "desc")
      .get();

    const organizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Organizations fetch error:", error);

    return NextResponse.json(
      {
        error: "組織一覧の取得に失敗しました",
        details:
          error instanceof Error ? error.message : "不明なエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
