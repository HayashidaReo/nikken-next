import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore
} from "firebase/firestore";

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase初期化
// Next.jsの高速リロード（HMR）に対応するため、すでに初期化済みかチェックする
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase サービスの取得
export const auth = getAuth(app);

// Firestoreの初期化（Dexie.jsをローカルストレージとして使用するため、永続化キャッシュは無効化）
export const db = initializeFirestore(app, {});


// デフォルトエクスポート
export default app;
