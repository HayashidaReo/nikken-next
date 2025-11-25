import React from "react";
// next/navigation の useRouter をモックしてテスト環境でのエラーを防ぐ
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchListTable } from "./match-list-table";
import { MasterDataProvider } from "@/components/providers/master-data-provider";
import type { Match } from "@/types/match.schema";
import type { Team } from "@/types/team.schema";

const sampleCourts = [
    { courtId: "court-1", courtName: "Aコート" },
    { courtId: "court-2", courtName: "Bコート" },
];

const sampleTeams: Team[] = [
    {
        teamId: "t-a",
        teamName: "Team A",
        representativeName: "Rep A",
        representativePhone: "000",
        representativeEmail: "a@example.com",
        remarks: "",
        isApproved: true,
        players: [
            {
                playerId: "p-a",
                lastName: "A",
                firstName: "Player",
                displayName: "Player A",
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Team,
    {
        teamId: "t-b",
        teamName: "Team B",
        representativeName: "Rep B",
        representativePhone: "000",
        representativeEmail: "b@example.com",
        remarks: "",
        isApproved: true,
        players: [
            {
                playerId: "p-b",
                lastName: "B",
                firstName: "Player",
                displayName: "Player B",
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Team,
];

const makeMatch = (overrides: Partial<Match> = {}): Match => {
    const base: Match = {
        matchId: "m-1",
        courtId: "court-1",
        roundId: "round-1",
        sortOrder: 0,
        isCompleted: false,
        players: {
            playerA: {
                playerId: "p-a",
                teamId: "t-a",
                score: 2,
                hansoku: 0,
            },
            playerB: {
                playerId: "p-b",
                teamId: "t-b",
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
        render(
            <MasterDataProvider courts={sampleCourts} teams={sampleTeams}>
                <MatchListTable matches={[]} tournamentName="Tourn" />
            </MasterDataProvider>
        );
        const scoreHeader = screen.getByText("得点");
        expect(scoreHeader).toHaveClass("text-center");
    });

    it("resolves and displays court name instead of courtId", () => {
        const m = makeMatch();
        render(
            <MasterDataProvider courts={sampleCourts} teams={sampleTeams}>
                <MatchListTable matches={[m]} tournamentName="Tourn" />
            </MasterDataProvider>
        );
        // court name should be displayed
        expect(screen.getByText("Aコート")).toBeInTheDocument();
    });

    it("displays round name resolved from roundId when rounds are provided", () => {
        const m = makeMatch({ roundId: "round-1" });
        render(
            <MasterDataProvider
                courts={sampleCourts}
                teams={sampleTeams}
                rounds={[{ roundId: "round-1", roundName: "1回戦" }]}
            >
                <MatchListTable
                    matches={[m]}
                    tournamentName="Tourn"
                />
            </MasterDataProvider>
        );

        expect(screen.getByText("1回戦")).toBeInTheDocument();
    });

    it("displays scores with a hyphen between them and aligned in the same row", () => {
        const m = makeMatch();
        render(
            <MasterDataProvider courts={sampleCourts} teams={sampleTeams}>
                <MatchListTable matches={[m]} tournamentName="Tourn" />
            </MasterDataProvider>
        );
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
            <MasterDataProvider courts={sampleCourts} teams={sampleTeams}>
                <MatchListTable matches={[noPenalty, withPenalty]} tournamentName="Tourn" />
            </MasterDataProvider>
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
        render(
            <MasterDataProvider courts={sampleCourts} teams={sampleTeams}>
                <MatchListTable matches={[m]} tournamentName="Tourn" />
            </MasterDataProvider>
        );
        const btn = screen.getByRole("button", { name: /モニター/ });
        await user.click(btn);
        // we don't assert navigation here, just ensure click handler runs without throwing
        expect(btn).toBeEnabled();
    });
});
