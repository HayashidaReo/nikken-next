import { renderHook, act } from "@testing-library/react";
import { useMonitorPageUi } from "./useMonitorPageUi";
import { useMonitorStore } from "@/store/use-monitor-store";
import type { Team } from "@/types/team.schema";
import type { TeamMatch } from "@/types/team-match.schema";

// Zustandストアのモック
jest.mock("@/store/use-monitor-store");

describe("useMonitorPageUi", () => {
    const mockHandleMonitorAction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // デフォルトのモックストア値
        (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({
                presentationConnected: false,
                fallbackOpen: false,
                isPublic: false,
                togglePublic: jest.fn(),
                viewMode: "scoreboard" as const,
            })
        );
    });

    describe("handleMonitorClick", () => {
        it("should call handleMonitorAction when not connected", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            act(() => {
                result.current.handleMonitorClick();
            });

            expect(mockHandleMonitorAction).toHaveBeenCalledTimes(1);
        });

        it("should show disconnect confirm dialog when connected", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: true,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            act(() => {
                result.current.handleMonitorClick();
            });

            expect(result.current.showDisconnectConfirm).toBe(true);
            expect(mockHandleMonitorAction).not.toHaveBeenCalled();
        });
    });

    describe("handleDisconnectConfirm", () => {
        it("should close dialog and call handleMonitorAction", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: true,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            // まずダイアログを開く
            act(() => {
                result.current.handleMonitorClick();
            });
            expect(result.current.showDisconnectConfirm).toBe(true);

            // 確定してクローズ
            act(() => {
                result.current.handleDisconnectConfirm();
            });

            expect(result.current.showDisconnectConfirm).toBe(false);
            expect(mockHandleMonitorAction).toHaveBeenCalledTimes(1);
        });
    });

    describe("orderedTeams", () => {
        it("should return null when teamMatches is undefined", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            expect(result.current.orderedTeams).toBeNull();
        });

        it("should return null when teamMatches is empty", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: [],
                    teams: [],
                })
            );

            expect(result.current.orderedTeams).toBeNull();
        });

        it("should return ordered teams when data is available", () => {
            const mockTeams: Team[] = [
                {
                    teamId: "team-a",
                    teamName: "チームA",
                    representativeName: "代表者A",
                    representativePhone: "090-1234-5678",
                    representativeEmail: "team-a@example.com",
                    players: [],
                    isApproved: true,
                    remarks: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    teamId: "team-b",
                    teamName: "チームB",
                    representativeName: "代表者B",
                    representativePhone: "090-1234-5679",
                    representativeEmail: "team-b@example.com",
                    players: [],
                    isApproved: true,
                    remarks: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            const mockTeamMatches: TeamMatch[] = [
                {
                    matchId: "match-1",
                    matchGroupId: "group-1",
                    roundId: "round-1",
                    players: {
                        playerA: {
                            playerId: "player-a",
                            teamId: "team-a",
                            score: 0,
                            hansoku: 0,
                        },
                        playerB: {
                            playerId: "player-b",
                            teamId: "team-b",
                            score: 0,
                            hansoku: 0,
                        },
                    },
                    sortOrder: 0,
                    isCompleted: false,
                    winner: "none",
                    winReason: "none",
                },
            ];

            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: mockTeamMatches,
                    teams: mockTeams,
                })
            );

            expect(result.current.orderedTeams).toEqual({
                teamA: mockTeams[0],
                teamB: mockTeams[1],
            });
        });

        it("should return null when teams are not found", () => {
            const mockTeamMatches: TeamMatch[] = [
                {
                    matchId: "match-1",
                    matchGroupId: "group-1",
                    roundId: "round-1",
                    players: {
                        playerA: {
                            playerId: "player-a",
                            teamId: "team-a",
                            score: 0,
                            hansoku: 0,
                        },
                        playerB: {
                            playerId: "player-b",
                            teamId: "team-b",
                            score: 0,
                            hansoku: 0,
                        },
                    },
                    sortOrder: 0,
                    isCompleted: false,
                    winner: "none",
                    winReason: "none",
                },
            ];

            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: mockTeamMatches,
                    teams: [], // チームが見つからない
                })
            );

            expect(result.current.orderedTeams).toBeNull();
        });
    });

    describe("monitorStatusMode", () => {
        it("should return 'presentation' when presentation is connected", () => {
            (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
                selector({
                    presentationConnected: true,
                    fallbackOpen: false,
                    isPublic: false,
                    togglePublic: jest.fn(),
                    viewMode: "scoreboard" as const,
                })
            );

            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            expect(result.current.monitorStatusMode).toBe("presentation");
        });

        it("should return 'fallback' when fallback is open", () => {
            (useMonitorStore as unknown as jest.Mock).mockImplementation((selector) =>
                selector({
                    presentationConnected: false,
                    fallbackOpen: true,
                    isPublic: false,
                    togglePublic: jest.fn(),
                    viewMode: "scoreboard" as const,
                })
            );

            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            expect(result.current.monitorStatusMode).toBe("fallback");
        });

        it("should return 'disconnected' when neither is connected", () => {
            const { result } = renderHook(() =>
                useMonitorPageUi({
                    handleMonitorAction: mockHandleMonitorAction,
                    isPresentationConnected: false,
                    teamMatches: undefined,
                    teams: undefined,
                })
            );

            expect(result.current.monitorStatusMode).toBe("disconnected");
        });
    });
});
