import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK 初期化
 * Server Components、Route Handlers、Cloud Functionsでのみ使用可能
 */
function initializeFirebaseAdmin() {
  // 既に初期化されている場合はそれを使用
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // 本番環境での認証情報設定
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // 秘密鍵とクライアントメールがある場合は cert で初期化
  if (privateKey && clientEmail && projectId) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } catch (error) {
      console.warn("Firebase Admin SDK credential initialization failed, falling back to default credentials:", error);
      // フォールバックへ進む
    }
  }

  // 環境変数が不足している場合、または初期化に失敗した場合は、デフォルトの認証情報（エミュレーターやADC）を試みる
  // projectId だけでもあると良いが、なくても動作する場合がある（エミュレーターなど）
  try {
    return initializeApp({
      projectId: projectId || "demo-project", // エミュレーター用にダミーIDを設定
    });
  } catch (error) {
    console.error("Firebase Admin SDK default initialization failed:", error);
    throw error; // ここで失敗した場合はどうしようもないので投げる
  }
}

// Firebase Admin アプリケーション
const adminApp = initializeFirebaseAdmin();

// Firebase Admin サービス
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// デフォルトエクスポート
export default adminApp;
