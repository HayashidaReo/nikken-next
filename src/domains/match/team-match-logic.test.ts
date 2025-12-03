import { analyzeTeamMatchStatus } from "./team-match-logic";
import { TeamMatch, WinReason } from "@/types/match.schema";
import { TEAM_MATCH_CONSTANTS } from "@/lib/constants";

// モックデータの作成ヘルパー
const createMockMatch = (
    matchId: string,
    sortOrder: number,
    roundId: string = "round-1",
    isCompleted: boolean = false,
    winner: "playerA" | "playerB" | "draw" | "none" = "none",
    winReason: WinReason = "none"
): TeamMatch => ({
    matchId,
    matchGroupId: "group-1",
    roundId,
    sortOrder,
    players: {
        playerA: { playerId: "pA", teamId: "tA", score: 0, hansoku: 0 },
        playerB: { playerId: "pB", teamId: "tB", score: 0, hansoku: 0 },
    },
    isCompleted,
    winner,
    winReason,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe("analyzeTeamMatchStatus", () => {
    const currentMatchId = "match-5";
    const currentSortOrder = 4;

    // 基本的な5試合のセットアップ
    const baseMatches = [
        createMockMatch("match-1", 0, "round-1", true, "playerA", "ippon"),
        createMockMatch("match-2", 1, "round-2", true, "playerB", "ippon"),
        createMockMatch("match-3", 2, "round-3", true, "playerA", "ippon"),
        createMockMatch("match-4", 3, "round-4", true, "playerB", "ippon"),
        createMockMatch("match-5", 4, TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ROUND_ID, false, "none", "none"),
    ];

    test("5試合目で決着がつく場合（Aの勝ち）", () => {
        // 現在の試合（5試合目）でAが勝つ -> A:3勝, B:2勝
        const result = analyzeTeamMatchStatus(
            baseMatches,
            currentMatchId,
            currentSortOrder,
            {
                playerA: { score: 1 },
                playerB: { score: 0 },
                winner: "playerA",
                winReason: "ippon",
            }
        );

        expect(result.isAllFinished).toBe(true);
        expect(result.needsRepMatch).toBe(false);
    });

    test("5試合目で引き分けになり、代表戦が必要な場合", () => {
        // 現在の試合（5試合目）で引き分け -> A:2勝, B:2勝, 引:1 -> 代表戦必要
        const result = analyzeTeamMatchStatus(
            baseMatches,
            currentMatchId,
            currentSortOrder,
            {
                playerA: { score: 0 },
                playerB: { score: 0 },
                winner: "draw",
                winReason: "none",
            }
        );

        expect(result.isAllFinished).toBe(false);
        expect(result.needsRepMatch).toBe(true);
    });

    test("特殊な決着（判定勝ち）の場合", () => {
        // 現在の試合（5試合目）でAが判定勝ち -> A:3勝, B:2勝
        const result = analyzeTeamMatchStatus(
            baseMatches,
            currentMatchId,
            currentSortOrder,
            {
                playerA: { score: 0 },
                playerB: { score: 0 },
                winner: "playerA",
                winReason: "hantei", // 判定
            }
        );

        expect(result.isAllFinished).toBe(true);
        expect(result.needsRepMatch).toBe(false);
    });

    test("特殊な決着（不戦敗）の場合", () => {
        // 現在の試合（5試合目）でAが不戦敗（相手Bの勝ち） -> A:2勝, B:3勝
        const result = analyzeTeamMatchStatus(
            baseMatches,
            currentMatchId,
            currentSortOrder,
            {
                playerA: { score: 0 },
                playerB: { score: 0 },
                winner: "playerB",
                winReason: "fusen", // 不戦敗
            }
        );

        expect(result.isAllFinished).toBe(true);
        expect(result.needsRepMatch).toBe(false);
    });

    test("代表戦が既に存在する場合", () => {
        // 5試合目で引き分けだが、既に代表戦（match-6）が存在する
        const matchesWithRep = [
            ...baseMatches,
            createMockMatch("match-6", 6, TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID, false, "none", "none"),
        ];

        const result = analyzeTeamMatchStatus(
            matchesWithRep,
            currentMatchId,
            currentSortOrder,
            {
                playerA: { score: 0 },
                playerB: { score: 0 },
                winner: "draw",
                winReason: "none",
            }
        );

        // 代表戦へ進むため、全試合終了ではないが、新たな代表戦作成も不要
        expect(result.isAllFinished).toBe(false);
        expect(result.needsRepMatch).toBe(false);
    });

    test("代表戦が完了した場合", () => {
        // 代表戦（match-6）が完了している
        const matchesRepFinished = [
            ...baseMatches,
            createMockMatch("match-6", 6, TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID, true, "playerA", "ippon"),
        ];

        // 現在の試合IDを代表戦にする
        const result = analyzeTeamMatchStatus(
            matchesRepFinished,
            "match-6",
            6,
            {
                playerA: { score: 1 },
                playerB: { score: 0 },
                winner: "playerA",
                winReason: "ippon",
            }
        );

        expect(result.isAllFinished).toBe(true);
        expect(result.needsRepMatch).toBe(false);
    });

    test("途中経過（3試合目終了時）", () => {
        // 3試合目が終わったところ（まだ4,5試合目がある）
        const matchesInProgress = [
            createMockMatch("match-1", 1, "round-1", true, "playerA", "ippon"),
            createMockMatch("match-2", 2, "round-2", true, "playerB", "ippon"),
            createMockMatch("match-3", 3, "round-3", false, "none", "none"), // 現在の試合
            createMockMatch("match-4", 4, "round-4", false, "none", "none"),
            createMockMatch("match-5", 5, TEAM_MATCH_CONSTANTS.LAST_REGULAR_MATCH_ROUND_ID, false, "none", "none"),
        ];

        const result = analyzeTeamMatchStatus(
            matchesInProgress,
            "match-3",
            3,
            {
                playerA: { score: 1 },
                playerB: { score: 0 },
                winner: "playerA",
                winReason: "ippon",
            }
        );

        expect(result.isAllFinished).toBe(false);
        expect(result.needsRepMatch).toBe(false);
    });
});
