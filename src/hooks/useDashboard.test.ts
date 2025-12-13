import { renderHook, act } from "@testing-library/react";
import { useDashboard } from "./useDashboard";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatches } from "@/queries/use-matches";
import { useMatchGroups } from "@/queries/use-match-groups";
import { useTeamMatches } from "@/queries/use-team-matches";
import { useTeams } from "@/queries/use-teams";
import { useTournament } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { syncService } from "@/services/sync-service";
import { useToast } from "@/components/providers/notification-provider";

// Mock dependencies
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

jest.mock("@/queries/use-matches", () => ({
    useMatches: jest.fn(),
}));

jest.mock("@/queries/use-match-groups", () => ({
    useMatchGroups: jest.fn(),
}));

jest.mock("@/queries/use-team-matches", () => ({
    useTeamMatches: jest.fn(),
}));

jest.mock("@/queries/use-teams", () => ({
    useTeams: jest.fn(),
}));

jest.mock("@/queries/use-tournaments", () => ({
    useTournament: jest.fn(),
}));

jest.mock("@/store/use-auth-store", () => ({
    useAuthStore: jest.fn(),
}));

jest.mock("@/store/use-active-tournament-store", () => ({
    useActiveTournament: jest.fn(),
}));

jest.mock("@/services/sync-service", () => ({
    syncService: {
        downloadTournamentData: jest.fn(),
    },
}));

jest.mock("@/components/providers/notification-provider", () => ({
    useToast: jest.fn(),
}));

describe("useDashboard", () => {
    const mockRouter = { push: jest.fn(), back: jest.fn() };
    const mockSearchParams = { get: jest.fn() };
    const mockShowSuccess = jest.fn();
    const mockShowError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        (useToast as jest.Mock).mockReturnValue({
            showSuccess: mockShowSuccess,
            showError: mockShowError,
        });

        // Default mock implementations
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "test-user-id" },
        });
        (useActiveTournament as unknown as jest.Mock).mockReturnValue({
            activeTournamentId: "test-tournament-id",
            activeTournamentType: "individual",
            setActiveTournament: jest.fn(),
        });
        (useMatches as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        });
        (useTournament as jest.Mock).mockReturnValue({
            data: { courts: [] },
            isLoading: false,
            error: null,
        });
        (useTeams as jest.Mock).mockReturnValue({ data: [] });
        (useMatchGroups as jest.Mock).mockReturnValue({ data: [] });
        (useTeamMatches as jest.Mock).mockReturnValue({ data: [] });
    });

    it("should return initial state correctly", () => {
        const { result } = renderHook(() => useDashboard());

        expect(result.current.needsTournamentSelection).toBe(false);
        expect(result.current.orgId).toBe("test-user-id");
        expect(result.current.activeTournamentId).toBe("test-tournament-id");
        expect(result.current.isDownloading).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasError).toBeNull();
    });

    it("should handle needsTournamentSelection when activeTournamentId is missing", () => {
        (useActiveTournament as unknown as jest.Mock).mockReturnValue({
            activeTournamentId: null,
            activeTournamentType: null,
            setActiveTournament: jest.fn(),
        });

        const { result } = renderHook(() => useDashboard());

        expect(result.current.needsTournamentSelection).toBe(true);
    });

    it("should handle loading state", () => {
        (useMatches as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        });

        const { result } = renderHook(() => useDashboard());

        expect(result.current.isLoading).toBe(true);
    });

    it("should handle error state", () => {
        const error = new Error("Test error");
        (useMatches as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
            error: error,
        });

        const { result } = renderHook(() => useDashboard());

        expect(result.current.hasError).toBe(error);
    });

    it("should handle handleDownload success", async () => {
        window.confirm = jest.fn().mockReturnValue(true);
        (syncService.downloadTournamentData as jest.Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() => useDashboard());

        await act(async () => {
            await result.current.handleDownload();
        });

        expect(syncService.downloadTournamentData).toHaveBeenCalledWith(
            "test-user-id",
            "test-tournament-id"
        );
        expect(mockShowSuccess).toHaveBeenCalledWith("データの取得が完了しました");
        expect(result.current.isDownloading).toBe(false);
    });

    it("should handle handleDownload failure", async () => {
        window.confirm = jest.fn().mockReturnValue(true);
        (syncService.downloadTournamentData as jest.Mock).mockRejectedValue(
            new Error("Download failed")
        );

        const { result } = renderHook(() => useDashboard());

        await act(async () => {
            await result.current.handleDownload();
        });

        expect(mockShowError).toHaveBeenCalledWith("データの取得に失敗しました");
        expect(result.current.isDownloading).toBe(false);
    });

    it("should not download if confirm is cancelled", async () => {
        window.confirm = jest.fn().mockReturnValue(false);

        const { result } = renderHook(() => useDashboard());

        await act(async () => {
            await result.current.handleDownload();
        });

        expect(syncService.downloadTournamentData).not.toHaveBeenCalled();
    });

    it("should handle handleBack", () => {
        const { result } = renderHook(() => useDashboard());

        act(() => {
            result.current.handleBack();
        });

        expect(mockRouter.back).toHaveBeenCalled();
    });

    it("should return matchGroupId from searchParams", () => {
        mockSearchParams.get.mockReturnValue("test-group-id");

        const { result } = renderHook(() => useDashboard());

        expect(result.current.matchGroupId).toBe("test-group-id");
    });
});
