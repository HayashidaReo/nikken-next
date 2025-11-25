"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { Team } from "@/types/team.schema";
import type { Court, Round } from "@/types/tournament.schema";

interface MasterDataState {
    teams: Map<string, Team>;
    courts: Map<string, Court>;
    rounds: Map<string, Round>;
}

interface MasterDataContextValue extends MasterDataState {
    getTeam: (teamId: string) => Team | undefined;
    getCourt: (courtId: string) => Court | undefined;
    getRound: (roundId: string) => Round | undefined;
}

const MasterDataContext = createContext<MasterDataContextValue | null>(null);

interface MasterDataProviderProps {
    teams: Team[];
    courts: Court[];
    rounds?: Round[];
    children: React.ReactNode;
}

export function MasterDataProvider({
    teams,
    courts,
    rounds = [],
    children,
}: MasterDataProviderProps) {
    const teamsMap = useMemo(() => {
        return new Map(teams.map((t) => [t.teamId, t]));
    }, [teams]);

    const courtsMap = useMemo(() => {
        return new Map(courts.map((c) => [c.courtId, c]));
    }, [courts]);

    const roundsMap = useMemo(() => {
        return new Map(rounds.map((r) => [r.roundId, r]));
    }, [rounds]);

    const value = useMemo(
        () => ({
            teams: teamsMap,
            courts: courtsMap,
            rounds: roundsMap,
            getTeam: (teamId: string) => teamsMap.get(teamId),
            getCourt: (courtId: string) => courtsMap.get(courtId),
            getRound: (roundId: string) => roundsMap.get(roundId),
        }),
        [teamsMap, courtsMap, roundsMap]
    );

    return (
        <MasterDataContext.Provider value={value}>
            {children}
        </MasterDataContext.Provider>
    );
}

export function useMasterData() {
    const context = useContext(MasterDataContext);
    if (!context) {
        throw new Error("useMasterData must be used within a MasterDataProvider");
    }
    return context;
}
