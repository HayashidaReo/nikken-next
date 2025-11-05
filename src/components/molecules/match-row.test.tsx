import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchRow } from "@/components/molecules/match-row";
import type { Team } from "@/types/team.schema";

const sampleRow = {
    id: "m-1",
    courtId: "c1",
    round: "予選1回戦",
    playerATeamId: "t1",
    playerAId: "p1",
    playerBTeamId: "t2",
    playerBId: "p2",
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

        render(
            <table>
                <tbody>
                    <MatchRow
                        row={sampleRow}
                        index={0}
                        approvedTeams={teams as Team[]}
                        courts={[{ courtId: "c1", courtName: "Court 1" }]}
                        getPlayersFromTeam={(teamId: string) =>
                            teams.find(t => t.teamId === teamId)?.players ?? []
                        }
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                    />
                </tbody>
            </table>
        );

        // Delete button is the last button in the row; ensure it exists and triggers onRemove
        const buttons = screen.getAllByRole("button");
        const deleteBtn = buttons[buttons.length - 1];
        await user.click(deleteBtn);
        expect(handleRemove).toHaveBeenCalledTimes(1);
    });
});
