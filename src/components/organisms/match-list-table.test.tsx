import React from "react";
// next/navigation の useRouter をモックしてテスト環境でのエラーを防ぐ
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchListTable } from "./match-list-table";
import type { Match } from "@/types/match.schema";

const sampleCourts = [
    { courtId: "court-1", courtName: "Aコート" },
    { courtId: "court-2", courtName: "Bコート" },
];

const makeMatch = (overrides: Partial<Match> = {}): Match => {
    const base: Match = {
        matchId: "m-1",
        courtId: "court-1",
        round: "1回戦",
        players: {
            playerA: {
                displayName: "Player A",
                playerId: "p-a",
                teamId: "t-a",
                teamName: "Team A",
                score: 2,
                hansoku: 0,
            },
            playerB: {
                displayName: "Player B",
                playerId: "p-b",
                teamId: "t-b",
                teamName: "Team B",
                score: 1,
                hansoku: 0,
            },
        },
        createdAt: undefined,
        updatedAt: undefined,
    } as unknown as Match;

    return { ...base, ...overrides } as Match;
};

describe("MatchListTable display", () => {
    it("renders header score label centered", () => {
        render(<MatchListTable matches={[]} tournamentName="Tourn" courts={sampleCourts} />);
        const scoreHeader = screen.getByText("得点");
        expect(scoreHeader).toHaveClass("text-center");
    });

    it("resolves and displays court name instead of courtId", () => {
        const m = makeMatch();
        render(<MatchListTable matches={[m]} tournamentName="Tourn" courts={sampleCourts} />);
        // court name should be displayed
        expect(screen.getByText("Aコート")).toBeInTheDocument();
    });

    it("displays scores with a hyphen between them and aligned in the same row", () => {
        const m = makeMatch();
        render(<MatchListTable matches={[m]} tournamentName="Tourn" courts={sampleCourts} />);
        // find the row containing player A
        const playerA = screen.getByText("Player A");
        const row = playerA.closest("tr");
        expect(row).toBeTruthy();
        if (!row) return;
        const utils = within(row);
        // numbers and hyphen should appear within the same row
        expect(utils.getByText("2")).toBeInTheDocument();
        // pick the score hyphen (larger text) specifically
        expect(
            utils.getByText((text, el) => text.trim() === "-" && !!el && el.classList.contains("text-xl"))
        ).toBeInTheDocument();
        expect(utils.getByText("1")).toBeInTheDocument();
    });

    it("shows penalty hyphen when no penalties and colored cards when present", () => {
        const noPenalty = makeMatch();
        const withPenalty: Match = makeMatch({
            matchId: "m-2",
            players: {
                playerA: { ...noPenalty.players.playerA, hansoku: 2 },
                playerB: { ...noPenalty.players.playerB, hansoku: 3 },
            },
        });

        const { container } = render(
            <MatchListTable matches={[noPenalty, withPenalty]} tournamentName="Tourn" courts={sampleCourts} />
        );

        // For the no-penalty row: hyphen displays within penalty area
        // pick the first Player A row (noPenalty)
        const playerAElements = screen.getAllByText("Player A");
        const noPenRow = playerAElements[0].closest("tr");
        expect(noPenRow).toBeTruthy();
        if (noPenRow) {
            const utils = within(noPenRow);
            // there should be at least one hyphen element representing penalty area
            const hyphens = utils.getAllByText("-");
            expect(hyphens.length).toBeGreaterThanOrEqual(1);
        }

        // For the with-penalty row: there should be colored elements for cards
        // we check existence of elements with class names for colors
        const redCards = container.querySelectorAll(".bg-red-600");
        const yellowCards = container.querySelectorAll(".bg-yellow-400");
        expect(redCards.length).toBeGreaterThanOrEqual(1);
        expect(yellowCards.length).toBeGreaterThanOrEqual(1);
    });

    it("operation button triggers initializeMatch navigation when clicked (no runtime error)", async () => {
        const user = userEvent.setup();
        const m = makeMatch();
        render(<MatchListTable matches={[m]} tournamentName="Tourn" courts={sampleCourts} />);
        const btn = screen.getByRole("button", { name: /モニター/ });
        await user.click(btn);
        // we don't assert navigation here, just ensure click handler runs without throwing
        expect(btn).toBeEnabled();
    });
});
