import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchRow } from "@/components/molecules/match-row";
import { MasterDataProvider } from "@/components/providers/master-data-provider";
import type { Team } from "@/types/team.schema";

const sampleRow = {
    id: "m-1",
    courtId: "c1",
    roundId: "round-1",
    roundName: "予選1回戦",
    playerATeamId: "t1",
    playerAId: "p1",
    playerBTeamId: "t2",
    playerBId: "p2",
    sortOrder: 0,
};

const teams = [
    {
        teamId: "t1",
        teamName: "Team1",
        players: [{ playerId: "p1", lastName: "Yamada", firstName: "Taro", displayName: "Player1" }],
        representativeName: "Rep1",
        representativePhone: "000",
        representativeEmail: "a@b.c",
        remarks: "",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        teamId: "t2",
        teamName: "Team2",
        players: [{ playerId: "p2", lastName: "Suzuki", firstName: "Jiro", displayName: "Player2" }],
        representativeName: "Rep2",
        representativePhone: "111",
        representativeEmail: "c@d.e",
        remarks: "",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

describe("MatchRow", () => {
    it("renders and calls onRemove when delete button clicked", async () => {
        const user = userEvent.setup();
        const handleRemove = jest.fn();
        const handleUpdate = jest.fn();

        const { container } = render(
            <MasterDataProvider
                teams={teams as Team[]}
                courts={[{ courtId: "c1", courtName: "Court 1" }]}
                rounds={[{ roundId: "round-1", roundName: "予選1回戦" }]}
            >
                <table>
                    <tbody>
                        <MatchRow
                            row={sampleRow}
                            index={0}
                            getPlayersFromTeam={(teamId: string) =>
                                teams.find(t => t.teamId === teamId)?.players ?? []
                            }
                            onUpdate={handleUpdate}
                            onRemove={handleRemove}
                        />
                    </tbody>
                </table>
            </MasterDataProvider>
        );

        // Find the delete button with Trash2 icon (last button in the row)
        const buttons = container.querySelectorAll("button");
        const deleteBtn = Array.from(buttons).find((btn) => {
            const svg = btn.querySelector("svg");
            return svg && svg.classList.contains("lucide-trash2");
        }) as HTMLButtonElement;

        if (!deleteBtn) {
            throw new Error("Delete button not found");
        }

        await user.click(deleteBtn);

        expect(handleRemove).toHaveBeenCalledTimes(1);
        expect(handleRemove).toHaveBeenCalledWith(0);
    });
});
