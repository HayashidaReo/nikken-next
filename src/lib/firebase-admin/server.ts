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
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
        throw new Error('Firebase Admin SDK環境変数が設定されていません');
    }

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

// Firebase Admin アプリケーション
const adminApp = initializeFirebaseAdmin();

// Firebase Admin サービス
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

// デフォルトエクスポート
export default adminApp;