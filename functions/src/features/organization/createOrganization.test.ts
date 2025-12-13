import * as ftest from "firebase-functions-test";

// uuidのモック (ESM対策)
jest.mock("uuid", () => ({
    v4: () => "mock-uuid-" + Math.random().toString(36).substring(7),
}));

// モックのセットアップ
const firestoreMock = {
    collection: jest.fn(),
    batch: jest.fn(),
};
const authMock = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
};

// admin.firestore() と admin.auth() をモック化
jest.mock("firebase-admin", () => {
    const original = jest.requireActual("firebase-admin");
    return {
        ...original,
        firestore: Object.assign(jest.fn(() => firestoreMock), {
            Timestamp: {
                now: jest.fn(() => ({ toDate: () => new Date() })),
            },
        }),
        auth: jest.fn(() => authMock),
    };
});

// テスト対象のインポート（モック後に行う）
import { createOrganization } from "./createOrganization"; // 相対パスを調整

const testEnv = ftest();

const docRefMock: any = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    collection: jest.fn(), // assigned later
    id: "mock-doc-id",
};
const collectionRefMock: any = {
    doc: jest.fn(),
    add: jest.fn(),
};

// 循環参照の設定
docRefMock.collection.mockReturnValue(collectionRefMock);
collectionRefMock.doc.mockReturnValue(docRefMock);
firestoreMock.collection.mockReturnValue(collectionRefMock);

describe("createOrganization", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        testEnv.cleanup();
    });

    test("認証されていない場合はエラーになること", async () => {
        const wrapped = testEnv.wrap(createOrganization);
        await expect(wrapped({ data: {} } as any)).rejects.toThrow("認証が必要です");
    });

    test("システム管理者でない場合はエラーになること", async () => {
        // Firestoreモックの設定: ユーザー取得 -> role !== system_admin
        docRefMock.get.mockResolvedValue({
            exists: true,
            data: () => ({ role: "user" }),
        });

        const wrapped = testEnv.wrap(createOrganization);
        const request = {
            auth: { uid: "user-id" },
            data: {},
        } as any;

        await expect(wrapped(request)).rejects.toThrow("システム管理者権限が必要です");
    });

    test("正常系: 組織と管理者が作成されること", async () => {
        // 1. システム管理者チェックのモック
        docRefMock.get.mockResolvedValue({
            exists: true,
            data: () => ({ role: "system_admin" }),
        });

        // 2. Auth.createUser のモック
        authMock.createUser.mockResolvedValue({ uid: "new-org-id" });

        // 3. Batch のモック
        const batchMock = {
            set: jest.fn(),
            commit: jest.fn(),
        };
        firestoreMock.batch.mockReturnValue(batchMock);

        const wrapped = testEnv.wrap(createOrganization);
        const inputData = {
            orgName: "テスト組織",
            representativeName: "代表者名",
            representativePhone: "090-1234-5678",
            representativeEmail: "admin@example.com",
            adminEmail: "admin@example.com",
            adminPassword: "password123",
        };

        const result = await wrapped({
            auth: { uid: "sys-admin-id" },
            data: inputData,
        } as any);

        // 検証
        expect(result.success).toBe(true);
        expect(authMock.createUser).toHaveBeenCalledWith(expect.objectContaining({
            email: inputData.adminEmail,
        }));
        expect(batchMock.set).toHaveBeenCalled();
        expect(batchMock.commit).toHaveBeenCalled();
    });
});
