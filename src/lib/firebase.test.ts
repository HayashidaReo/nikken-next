/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";

// モック関数の定義
const mockInitializeApp = jest.fn(() => ({ name: "mocked-app" }));
const mockGetApps = jest.fn(() => []);
const mockGetApp = jest.fn(() => ({ name: "existing-app" }));
const mockGetAuth = jest.fn(() => ({ name: "mocked-auth" }));
const mockGetFirestore = jest.fn(() => ({ name: "mocked-firestore" }));
const mockGetFunctions = jest.fn(() => ({ name: "mocked-functions" }));

// Firebaseのモック
jest.mock("firebase/app", () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
}));

jest.mock("firebase/auth", () => ({
  getAuth: mockGetAuth,
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: mockGetFirestore,
}));

jest.mock("firebase/functions", () => ({
  getFunctions: mockGetFunctions,
}));

/**
 * Firebase設定のテストスイート
 *
 * 本テストは以下の内容をカバーします：
 * - Firebase SDKの初期化プロセス
 * - 環境変数に基づく設定の構築
 * - Firebase サービス（Auth、Firestore、Functions）の設定
 * - 既存アプリインスタンスの再利用ロジック
 */
describe("Firebase Configuration", () => {
  // 環境変数のモック
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // モック関数の初期状態をリセット
    mockInitializeApp.mockClear();
    mockGetApps.mockClear();
    mockGetApp.mockClear();
    mockGetAuth.mockClear();
    mockGetFirestore.mockClear();
    mockGetFunctions.mockClear();

    // デフォルトのモック動作を設定
    mockGetApps.mockReturnValue([]);
    mockInitializeApp.mockReturnValue({ name: "mocked-app" } as never);

    // 標準的なFirebase設定で環境変数を設定
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test-project.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test-project.appspot.com",
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:abcdef123456",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe("Firebase初期化テスト", () => {
    it("正しい設定でFirebaseが初期化される", async () => {
      // firebase.tsをインポートして初期化を実行
      await import("@/lib/firebase");

      expect(mockInitializeApp).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        authDomain: "test-project.firebaseapp.com",
        projectId: "test-project",
        storageBucket: "test-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123456789:web:abcdef123456",
      });
    });

    it("既にアプリが初期化済みの場合はgetAppを使用", async () => {
      // 既にアプリが存在する状態をシミュレート
      mockGetApps.mockReturnValue([{ name: "[DEFAULT]" }] as never[]);

      // firebase.tsを再インポート
      jest.resetModules();
      await import("@/lib/firebase");

      expect(mockGetApp).toHaveBeenCalled();
      expect(mockInitializeApp).not.toHaveBeenCalled();
    });

    it("Firebase サービスが正しく初期化される", async () => {
      // firebase.tsをインポート
      const firebase = await import("@/lib/firebase");

      // エクスポートされたサービスが存在することを確認
      expect(firebase.auth).toBeDefined();
      expect(firebase.db).toBeDefined();
      expect(firebase.cloudFunction).toBeDefined();

      // 各サービスの初期化関数が呼ばれることを確認
      expect(mockGetAuth).toHaveBeenCalled();
      expect(mockGetFirestore).toHaveBeenCalled();
      expect(mockGetFunctions).toHaveBeenCalled();
    });
  });

  describe("環境変数テスト", () => {
    it("環境変数が未設定の場合もエラーなく初期化される", async () => {
      // 環境変数をクリア
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: undefined,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: undefined,
        NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
      };

      // firebase.tsを再インポート
      jest.resetModules();
      await import("@/lib/firebase");

      // undefinedの値でも初期化が実行されることを確認
      expect(mockInitializeApp).toHaveBeenCalledWith({
        apiKey: undefined,
        authDomain: undefined,
        projectId: undefined,
        storageBucket: undefined,
        messagingSenderId: undefined,
        appId: undefined,
      });
    });

    it("設定オブジェクトが正しい構造を持つ", async () => {
      await import("@/lib/firebase");

      // initializeAppが呼ばれたことを確認し、引数をテスト
      expect(mockInitializeApp).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: expect.any(String),
          authDomain: expect.any(String),
          projectId: expect.any(String),
          storageBucket: expect.any(String),
          messagingSenderId: expect.any(String),
          appId: expect.any(String),
        })
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("Firebase初期化エラーが適切に処理される", async () => {
      // 初期化エラーをシミュレート
      mockInitializeApp.mockImplementation(() => {
        throw new Error("Firebase initialization failed");
      });

      // エラーが適切に伝播されることを確認
      await expect(async () => {
        jest.resetModules();
        await import("@/lib/firebase");
      }).rejects.toThrow("Firebase initialization failed");
    });
  });
});
