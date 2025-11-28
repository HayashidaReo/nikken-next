import { renderHook, act } from "@testing-library/react";
import { useMatchGroupFilter } from "./useMatchGroupFilter";
import type { MatchGroup } from "@/types/match.schema";
import { MATCH_GROUP_STATUS } from "@/lib/constants";

// SessionStorage のモック
const sessionStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
});

// useMasterData のモック
jest.mock("@/components/providers/master-data-provider", () => ({
    useMasterData: () => ({
        courts: new Map([
            ["court1", { courtId: "court1", courtName: "コート1" }],
            ["court2", { courtId: "court2", courtName: "コート2" }],
        ]),
        rounds: new Map([
            ["round1", { roundId: "round1", roundName: "1回戦" }],
            ["round2", { roundId: "round2", roundName: "2回戦" }],
        ]),
        teams: new Map(),
    }),
}));

// テスト用のモックデータ
const createMockMatchGroup = (
    id: string,
    courtId: string,
    roundId: string,
    isCompleted: boolean,
    sortOrder: number = 0
): MatchGroup => ({
    matchGroupId: id,
    courtId,
    roundId,
    teamAId: "teamA",
    teamBId: "teamB",
    isCompleted,
    sortOrder,
    createdAt: new Date(),
    updatedAt: new Date(),
});

const mockMatchGroups: MatchGroup[] = [
    createMockMatchGroup("1", "court1", "round1", false, 0),
    createMockMatchGroup("2", "court1", "round2", true, 1),
    createMockMatchGroup("3", "court2", "round1", false, 2),
    createMockMatchGroup("4", "court2", "round2", true, 3),
];

describe("useMatchGroupFilter", () => {
    beforeEach(() => {
        sessionStorageMock.clear();
    });

    it("初期状態では全ての試合グループを返す", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        expect(result.current.filteredMatchGroups).toEqual(mockMatchGroups);
        expect(result.current.selectedCourtIds).toEqual([]);
        expect(result.current.selectedRoundIds).toEqual([]);
        expect(result.current.selectedStatusValues).toEqual([]);
    });

    it("コートでフィルタリングできる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedCourtIds(["court1"]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(2);
        expect(result.current.filteredMatchGroups.every((g) => g.courtId === "court1")).toBe(true);
    });

    it("ラウンドでフィルタリングできる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedRoundIds(["round1"]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(2);
        expect(result.current.filteredMatchGroups.every((g) => g.roundId === "round1")).toBe(true);
    });

    it("ステータス（未試合）でフィルタリングできる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedStatusValues([MATCH_GROUP_STATUS.INCOMPLETE]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(2);
        expect(result.current.filteredMatchGroups.every((g) => !g.isCompleted)).toBe(true);
    });

    it("ステータス（終了）でフィルタリングできる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedStatusValues([MATCH_GROUP_STATUS.COMPLETED]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(2);
        expect(result.current.filteredMatchGroups.every((g) => g.isCompleted)).toBe(true);
    });

    it("複数のフィルターを組み合わせて使用できる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedCourtIds(["court1"]);
            result.current.setSelectedRoundIds(["round1"]);
            result.current.setSelectedStatusValues([MATCH_GROUP_STATUS.INCOMPLETE]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(1);
        expect(result.current.filteredMatchGroups[0].matchGroupId).toBe("1");
    });

    it("複数のコートを選択できる", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedCourtIds(["court1", "court2"]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(4);
    });

    it("フィルターをクリアすると全ての試合グループが表示される", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedCourtIds(["court1"]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(2);

        act(() => {
            result.current.setSelectedCourtIds([]);
        });

        expect(result.current.filteredMatchGroups).toHaveLength(4);
    });

    it("SessionStorageにフィルター状態を保存する", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        act(() => {
            result.current.setSelectedCourtIds(["court1"]);
            result.current.setSelectedRoundIds(["round2"]);
            result.current.setSelectedStatusValues([MATCH_GROUP_STATUS.COMPLETED]);
        });

        const savedData = sessionStorage.getItem("nikken-match-group-filters");
        expect(savedData).toBeTruthy();

        const parsed = JSON.parse(savedData!);
        expect(parsed.courtIds).toEqual(["court1"]);
        expect(parsed.roundIds).toEqual(["round2"]);
        expect(parsed.statusValues).toEqual([MATCH_GROUP_STATUS.COMPLETED]);
    });

    it("SessionStorageからフィルター状態を復元する", () => {
        const initialFilter = {
            courtIds: ["court2"],
            roundIds: ["round1"],
            statusValues: [MATCH_GROUP_STATUS.INCOMPLETE],
        };
        sessionStorage.setItem("nikken-match-group-filters", JSON.stringify(initialFilter));

        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        expect(result.current.selectedCourtIds).toEqual(["court2"]);
        expect(result.current.selectedRoundIds).toEqual(["round1"]);
        expect(result.current.selectedStatusValues).toEqual([MATCH_GROUP_STATUS.INCOMPLETE]);
        expect(result.current.filteredMatchGroups).toHaveLength(1);
        expect(result.current.filteredMatchGroups[0].matchGroupId).toBe("3");
    });

    it("空の配列が渡された場合でもエラーにならない", () => {
        const { result } = renderHook(() => useMatchGroupFilter([]));

        expect(result.current.filteredMatchGroups).toEqual([]);
        expect(result.current.courtOptions).toEqual([]);
        expect(result.current.roundOptions).toEqual([]);
    });

    it("courtOptionsが重複なく生成される", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        expect(result.current.courtOptions).toHaveLength(2);
        expect(result.current.courtOptions[0].label).toBe("コート1");
        expect(result.current.courtOptions[1].label).toBe("コート2");
    });

    it("roundOptionsが重複なく生成される", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        expect(result.current.roundOptions).toHaveLength(2);
        expect(result.current.roundOptions[0].label).toBe("1回戦");
        expect(result.current.roundOptions[1].label).toBe("2回戦");
    });

    it("statusOptionsが正しく提供される", () => {
        const { result } = renderHook(() => useMatchGroupFilter(mockMatchGroups));

        expect(result.current.statusOptions).toHaveLength(2);
        expect(result.current.statusOptions[0].value).toBe(MATCH_GROUP_STATUS.INCOMPLETE);
        expect(result.current.statusOptions[1].value).toBe(MATCH_GROUP_STATUS.COMPLETED);
    });
});
