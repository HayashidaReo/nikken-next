import { renderHook, act } from "@testing-library/react";
import { useTeamFilter } from "./useTeamFilter";
import type { Team } from "@/types/team.schema";

// テスト用のダミーデータ作成ヘルパー
const createMockTeam = (id: string, name: string): Team => ({
    teamId: id,
    teamName: name,
    representativeName: "Rep",
    representativePhone: "000-0000-0000",
    representativeEmail: "test@example.com",
    players: [],
    remarks: "",
    isApproved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe("useTeamFilter", () => {
    const mockTeams: Team[] = [
        createMockTeam("1", "Alpha Team"),
        createMockTeam("2", "Beta Team"),
        createMockTeam("3", "Charlie Team"),
        createMockTeam("4", "Delta Force"),
    ];

    it("初期状態では全てのチームを返すこと", () => {
        const { result } = renderHook(() => useTeamFilter(mockTeams));

        expect(result.current.searchQuery).toBe("");
        expect(result.current.filteredTeams).toHaveLength(4);
        expect(result.current.filteredTeams).toEqual(mockTeams);
    });

    it("検索クエリに基づいてチームをフィルタリングできること（部分一致・大文字小文字区別なし）", () => {
        const { result } = renderHook(() => useTeamFilter(mockTeams));

        // "alpha" で検索 -> "Alpha Team" がヒットするはず
        act(() => {
            result.current.setSearchQuery("alpha");
        });

        expect(result.current.filteredTeams).toHaveLength(1);
        expect(result.current.filteredTeams[0].teamName).toBe("Alpha Team");

        // "team" で検索 -> "Alpha Team", "Beta Team", "Charlie Team" がヒットするはず
        act(() => {
            result.current.setSearchQuery("team");
        });

        expect(result.current.filteredTeams).toHaveLength(3);
    });

    it("一致するチームがない場合は空配列を返すこと", () => {
        const { result } = renderHook(() => useTeamFilter(mockTeams));

        act(() => {
            result.current.setSearchQuery("Omega");
        });

        expect(result.current.filteredTeams).toHaveLength(0);
    });

    it("検索クエリをクリアすると再び全件返ること", () => {
        const { result } = renderHook(() => useTeamFilter(mockTeams));

        act(() => {
            result.current.setSearchQuery("Alpha");
        });
        expect(result.current.filteredTeams).toHaveLength(1);

        act(() => {
            result.current.setSearchQuery("");
        });
        expect(result.current.filteredTeams).toHaveLength(4);
    });

    it("空のチーム配列が渡された場合は空配列を返すこと", () => {
        const { result } = renderHook(() => useTeamFilter([]));

        expect(result.current.filteredTeams).toHaveLength(0);
    });
});
