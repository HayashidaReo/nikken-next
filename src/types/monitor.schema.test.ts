import { monitorDataSchema, monitorPlayerSchema } from "./monitor.schema";

describe("monitorPlayerSchema", () => {
    it("should validate valid player data", () => {
        const validPlayer = {
            displayName: "Test Player",
            teamName: "Test Team",
            score: 1,
            hansoku: 0,
        };
        const result = monitorPlayerSchema.safeParse(validPlayer);
        expect(result.success).toBe(true);
    });

    it("should fail with missing fields", () => {
        const invalidPlayer = {
            displayName: "Test Player",
            // teamName missing
            score: 1,
            hansoku: 0,
        };
        const result = monitorPlayerSchema.safeParse(invalidPlayer);
        expect(result.success).toBe(false);
    });

    it("should fail with invalid types", () => {
        const invalidPlayer = {
            displayName: "Test Player",
            teamName: "Test Team",
            score: "1", // Should be number
            hansoku: 0,
        };
        const result = monitorPlayerSchema.safeParse(invalidPlayer);
        expect(result.success).toBe(false);
    });
});

describe("monitorDataSchema", () => {
    const validPlayer = {
        displayName: "Test Player",
        teamName: "Test Team",
        score: 0,
        hansoku: 0,
    };

    it("should validate valid monitor data", () => {
        const validData = {
            matchId: "match-123",
            tournamentName: "Test Tournament",
            courtName: "Court A",
            roundName: "Final",
            playerA: validPlayer,
            playerB: validPlayer,
            timeRemaining: 300,
            isTimerRunning: false,
            isPublic: true,
        };
        const result = monitorDataSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it("should fail with missing top-level fields", () => {
        const invalidData = {
            matchId: "match-123",
            // tournamentName missing
            courtName: "Court A",
            roundName: "Final",
            playerA: validPlayer,
            playerB: validPlayer,
            timeRemaining: 300,
            isTimerRunning: false,
            isPublic: true,
        };
        const result = monitorDataSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });

    it("should fail with invalid nested player data", () => {
        const invalidData = {
            matchId: "match-123",
            tournamentName: "Test Tournament",
            courtName: "Court A",
            roundName: "Final",
            playerA: { ...validPlayer, score: "invalid" }, // Invalid score type
            playerB: validPlayer,
            timeRemaining: 300,
            isTimerRunning: false,
            isPublic: true,
        };
        const result = monitorDataSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
});
