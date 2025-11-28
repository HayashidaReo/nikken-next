export interface MatchGroupSetupData {
    id: string;
    courtId: string;
    roundId: string;
    roundName: string;
    teamAId: string;
    teamBId: string;
    sortOrder: number;
    isCompleted: boolean;
}

export interface TeamMatchSetupData {
    id: string;
    roundId: string;
    roundName: string;
    playerAId: string;
    playerBId: string;
    sortOrder: number;
}
