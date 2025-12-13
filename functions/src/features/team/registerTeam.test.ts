import * as ftest from "firebase-functions-test";

// モックのセットアップ
const firestoreMock = {
    collection: jest.fn(),
    doc: jest.fn(),
};

// admin.firestore() をモック化
jest.mock("firebase-admin", () => {
    const original = jest.requireActual("firebase-admin");
    return {
        ...original,
        firestore: Object.assign(jest.fn(() => firestoreMock), {
            Timestamp: {
                now: jest.fn(() => ({ toDate: () => new Date() })),
            },
        }),
    };
});

// テスト対象のインポート
import { registerTeam } from "./registerTeam";

const testEnv = ftest();

const docRefMock: any = {
    get: jest.fn(),
    set: jest.fn(),
    add: jest.fn(),
    collection: jest.fn(),
    id: "mock-doc-id",
};
const collectionRefMock: any = {
    doc: jest.fn(),
    add: jest.fn(),
    where: jest.fn(),
    get: jest.fn(),
};

// 循環参照の設定
docRefMock.collection.mockReturnValue(collectionRefMock);
collectionRefMock.doc.mockReturnValue(docRefMock);
collectionRefMock.where.mockReturnValue(collectionRefMock);
collectionRefMock.get.mockResolvedValue({ empty: true }); // デフォルトは重複なし
firestoreMock.collection.mockReturnValue(collectionRefMock);
firestoreMock.doc.mockReturnValue(docRefMock);

describe("registerTeam", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        testEnv.cleanup();
    });

    test("大会の isTeamFormOpen が false の場合はエラーになること", async () => {
        // 大会ドキュメント取得のモック: isTeamFormOpen: false
        docRefMock.get.mockResolvedValue({
            exists: true,
            data: () => ({
                isTeamFormOpen: false,
                tournamentName: "非公開大会",
            }),
        });

        const wrapped = testEnv.wrap(registerTeam);
        const request = {
            data: {
                orgId: "org-1",
                tournamentId: "tour-1",
                teamName: "参加チーム",
                representativeName: "代表者",
                representativePhone: "090-0000-0000",
                representativeEmail: "test@example.com",
                players: [],
            },
        } as any;

        await expect(wrapped(request)).rejects.toThrow("現在、こ大会の参加申し込みは受け付けていません");
    });

    test("大会の isTeamFormOpen が true の場合は成功すること（最低限の確認）", async () => {
        // 大会ドキュメント取得のモック: isTeamFormOpen: true
        docRefMock.get.mockResolvedValue({
            exists: true,
            data: () => ({
                isTeamFormOpen: true,
                tournamentName: "公開大会",
            }),
        });

        // 既存チームチェックのモック (empty: true -> 重複なし)
        collectionRefMock.get.mockResolvedValue({ empty: true });

        const wrapped = testEnv.wrap(registerTeam);
        const request = {
            data: {
                orgId: "org-1",
                tournamentId: "tour-1",
                teamName: "参加チーム",
                representativeName: "代表者",
                representativePhone: "090-0000-0000",
                representativeEmail: "test@example.com",
                players: [],
            },
        } as any;

        const result = await wrapped(request);
        expect(result.success).toBe(true);
    });
});
