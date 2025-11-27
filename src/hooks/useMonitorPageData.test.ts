import { renderHook } from "@testing-library/react";
import { useMonitorPageData } from "./useMonitorPageData";
import { useMatchDataWithPriority } from "./useMatchDataWithPriority";
import { useTeamMatches } from "@/queries/use-team-matches";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { useMonitorStore } from "@/store/use-monitor-store";

// モック
jest.mock("./useMatchDataWithPriority");
jest.mock("@/queries/use-team-matches");
jest.mock("@/queries/use-teams");
jest.mock("@/queries/use-tournaments");
jest.mock("@/store/use-monitor-store");

describe("useMonitorPageData", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return loading state initially", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: true,
            hasError: false,
            matchFound: false,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: null })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: undefined });
        (useTeams as jest.Mock).mockReturnValue({ data: undefined });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        const { result } = renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasError).toBe(false);
        expect(result.current.matchFound).toBe(false);
    });

    it("should return match data when available", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: false,
            matchFound: true,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: "group-123" })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: [] });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useTournament as jest.Mock).mockReturnValue({ data: { tournamentId: "tournament-123" } });

        const { result } = renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.matchFound).toBe(true);
        expect(result.current.matchGroupId).toBe("group-123");
        expect(result.current.teamMatches).toEqual([]);
        expect(result.current.teams).toEqual([]);
        expect(result.current.tournament).toEqual({ tournamentId: "tournament-123" });
    });

    it("should return error state when match fetch fails", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: true,
            matchFound: false,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: null })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: undefined });
        (useTeams as jest.Mock).mockReturnValue({ data: undefined });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        const { result } = renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(result.current.hasError).toBe(true);
        expect(result.current.matchFound).toBe(false);
    });

    it("should pass null to useTeamMatches when matchGroupId is null", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: false,
            matchFound: true,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: null })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: undefined });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(useTeamMatches).toHaveBeenCalledWith(null);
    });

    it("should pass matchGroupId to useTeamMatches when available", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: false,
            matchFound: true,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: "group-123" })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: [] });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(useTeamMatches).toHaveBeenCalledWith("group-123");
    });

    it("should call useMatchDataWithPriority with correct matchId", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: false,
            matchFound: true,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: null })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: undefined });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        renderHook(() =>
            useMonitorPageData({
                matchId: "match-456",
                orgId: "org-123",
                activeTournamentId: "tournament-123",
            })
        );

        expect(useMatchDataWithPriority).toHaveBeenCalledWith("match-456");
    });

    it("should call useTournament with correct orgId and tournamentId", () => {
        (useMatchDataWithPriority as jest.Mock).mockReturnValue({
            isLoading: false,
            hasError: false,
            matchFound: true,
        });
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ matchGroupId: null })
        );
        (useTeamMatches as jest.Mock).mockReturnValue({ data: undefined });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useTournament as jest.Mock).mockReturnValue({ data: undefined });

        renderHook(() =>
            useMonitorPageData({
                matchId: "match-123",
                orgId: "org-456",
                activeTournamentId: "tournament-789",
            })
        );

        expect(useTournament).toHaveBeenCalledWith("org-456", "tournament-789");
    });
});
