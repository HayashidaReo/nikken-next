
import { TeamDependencyService } from "./team-dependency-service";
import type { MatchGroup, Match } from "@/types/match.schema";

describe("TeamDependencyService", () => {
    const targetTeamId = "target-team-id";
    const otherTeamId = "other-team-id";

    // Mock helpers
    const createMatchGroup = (teamA: string, teamB: string): MatchGroup => ({
        matchGroupId: "mg1",
        courtId: "c1",
        roundId: "r1",
        teamAId: teamA,
        teamBId: teamB,
        sortOrder: 1,
        isCompleted: false,
    });

    const createMatch = (teamA: string, teamB: string): Match => ({
        matchId: "m1",
        courtId: "c1",
        roundId: "r1",
        players: {
            playerA: { playerId: "p1", teamId: teamA, score: 0, hansoku: 0 },
            playerB: { playerId: "p2", teamId: teamB, score: 0, hansoku: 0 },
        },
        sortOrder: 1,
        isCompleted: false,
        winner: null,
        winReason: null,
    });

    describe("validateDeletion", () => {
        it("should not throw error when there are no dependencies", () => {
            const matchGroups: MatchGroup[] = [];
            const matches: Match[] = [];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).not.toThrow();
        });

        it("should not throw error when dependencies are for other teams", () => {
            const matchGroups = [createMatchGroup(otherTeamId, "another-team")];
            const matches = [createMatch(otherTeamId, "another-team")];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).not.toThrow();
        });

        it("should throw specific error when dependent ONLY on MatchGroup (team A)", () => {
            const matchGroups = [createMatchGroup(targetTeamId, otherTeamId)];
            const matches: Match[] = [];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（団体戦）」に関連付けられているため削除できません。\n先に対戦カードを削除してください。");
        });

        it("should throw specific error when dependent ONLY on MatchGroup (team B)", () => {
            const matchGroups = [createMatchGroup(otherTeamId, targetTeamId)];
            const matches: Match[] = [];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（団体戦）」に関連付けられているため削除できません。\n先に対戦カードを削除してください。");
        });

        it("should throw specific error when dependent ONLY on Match (team A)", () => {
            const matchGroups: MatchGroup[] = [];
            const matches = [createMatch(targetTeamId, otherTeamId)];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（個人戦）」の参加選手に関連付けられているため削除できません。\n先に対戦カードを削除してください。");
        });

        it("should throw specific error when dependent ONLY on Match (team B)", () => {
            const matchGroups: MatchGroup[] = [];
            const matches = [createMatch(otherTeamId, targetTeamId)];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（個人戦）」の参加選手に関連付けられているため削除できません。\n先に対戦カードを削除してください。");
        });

        it("should throw combined error when dependent on BOTH", () => {
            const matchGroups = [createMatchGroup(targetTeamId, otherTeamId)];
            const matches = [createMatch(targetTeamId, otherTeamId)];

            expect(() => {
                TeamDependencyService.validateDeletion(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（団体戦）」および「対戦カード（個人戦）」の両方に関連付けられているため削除できません。\n先に対戦データを削除してください。");
        });
    });

    describe("validateUnapproval", () => {
        it("should not throw error when there are no dependencies", () => {
            const matchGroups: MatchGroup[] = [];
            const matches: Match[] = [];

            expect(() => {
                TeamDependencyService.validateUnapproval(targetTeamId, matchGroups, matches);
            }).not.toThrow();
        });

        it("should throw specific error when dependent ONLY on MatchGroup", () => {
            const matchGroups = [createMatchGroup(targetTeamId, otherTeamId)];
            const matches: Match[] = [];

            expect(() => {
                TeamDependencyService.validateUnapproval(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（団体戦）」に関連付けられているため承認を取り消せません。\n先に対戦カードを削除してください。");
        });

        it("should throw specific error when dependent ONLY on Match", () => {
            const matchGroups: MatchGroup[] = [];
            const matches = [createMatch(targetTeamId, otherTeamId)];

            expect(() => {
                TeamDependencyService.validateUnapproval(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（個人戦）」の参加選手に関連付けられているため承認を取り消せません。\n先に対戦カードを削除してください。");
        });

        it("should throw combined error when dependent on BOTH", () => {
            const matchGroups = [createMatchGroup(targetTeamId, otherTeamId)];
            const matches = [createMatch(targetTeamId, otherTeamId)];

            expect(() => {
                TeamDependencyService.validateUnapproval(targetTeamId, matchGroups, matches);
            }).toThrow("このチームは「対戦カード（団体戦）」および「対戦カード（個人戦）」の両方に関連付けられているため承認を取り消せません。\n先に対戦データを削除してください。");
        });
    });
});
