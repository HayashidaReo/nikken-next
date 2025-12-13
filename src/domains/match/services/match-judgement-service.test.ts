import { MatchJudgementService } from "./match-judgement-service";
import { TeamMatch } from "@/types/match.schema";
import { TEAM_MATCH_CONSTANTS } from "@/lib/constants";

// Helper to create a partial mock match
const createMockMatch = (
    winner: "playerA" | "playerB" | "draw" | "none",
    isCompleted = true,
    roundId = "r1",
    sortOrder = 1
): TeamMatch => ({
    matchId: "test-match",
    matchGroupId: "mg1",
    roundId,
    sortOrder,
    players: {
        playerA: { playerId: "p1", teamId: "t1", score: 0, hansoku: 0 },
        playerB: { playerId: "p2", teamId: "t2", score: 0, hansoku: 0 },
    },
    isCompleted,
    winner,
    winReason: "ippon",
});

describe("MatchJudgementService", () => {
    describe("judgeTeamMatchWinner", () => {
        it("should return teamA when teamA has more wins", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA"),
                createMockMatch("playerA"),
                createMockMatch("playerB"), // 2-1
            ];
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBe("teamA");
        });

        it("should return teamB when teamB has more wins", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA"),
                createMockMatch("playerB"),
                createMockMatch("playerB"), // 1-2
            ];
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBe("teamB");
        });

        it("should return undefined when wins are equal and no rep match", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA"),
                createMockMatch("playerB"), // 1-1
            ];
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBeUndefined();
        });

        it("should return teamA when wins are equal but teamA won rep match", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA"),
                createMockMatch("playerB"),
                createMockMatch("playerA", true, TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID), // Rep match
            ];
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBe("teamA");
        });

        it("should return teamB when wins are equal but teamB won rep match", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA"),
                createMockMatch("playerB"),
                createMockMatch("playerB", true, TEAM_MATCH_CONSTANTS.REP_MATCH_ROUND_ID), // Rep match
            ];
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBe("teamB");
        });

        it("should ignore incomplete matches for regular counting", () => {
            const matches: TeamMatch[] = [
                createMockMatch("playerA", true),
                createMockMatch("playerB", false), // Incomplete, should be ignored
            ];
            // 1 win for A, 0 for B (effectively)
            const result = MatchJudgementService.judgeTeamMatchWinner(matches);
            expect(result).toBe("teamA");
        });
    });
});
