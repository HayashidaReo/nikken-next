"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicTournamentService } from "@/services/public-tournament-service";
import { Tournament } from "@/types/tournament.schema";
import { MatchGroup } from "@/types/match.schema";
import { Team } from "@/types/team.schema";
import { BracketView } from "@/components/organisms/tournament-bracket/bracket-view";
import { Loader2 } from "lucide-react";

export default function TournamentBracketPage() {
    const params = useParams();
    const orgId = params?.orgId as string;
    const tournamentId = params?.tournamentId as string;

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matchGroups, setMatchGroups] = useState<MatchGroup[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId || !tournamentId) return;

        let unsubscribeFn = () => { };

        // 1. 大会情報の取得
        publicTournamentService.getTournamentById(orgId, tournamentId).then(t => {
            if (t) {
                setTournament(t);
                // 2. チーム情報の取得
                publicTournamentService.getTeams(orgId, tournamentId).then(loadedTeams => {
                    setTeams(loadedTeams);
                    // 3. MatchGroupsの初期取得とリアルタイム購読
                    unsubscribeFn = publicTournamentService.listenMatchGroups(orgId, tournamentId, (groups) => {
                        setMatchGroups(groups);
                        setLoading(false);
                    });
                }).catch(e => {
                    console.error(e);
                    setError("チーム情報の取得に失敗しました");
                    setLoading(false);
                });
            } else {
                setError("大会が見つかりませんでした。");
                setLoading(false);
            }
        }).catch(e => {
            console.error(e);
            setError("データの取得に失敗しました");
            setLoading(false);
        });

        return () => {
            unsubscribeFn();
        };
    }, [orgId, tournamentId]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
                <p className="text-red-500 font-bold">{error || "エラーが発生しました"}</p>
                <p className="text-slate-500">IDが正しいか確認してください</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="bg-white border-b px-6 py-4 shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">{tournament.tournamentName}</h1>
                <p className="text-sm text-slate-500">{tournament.tournamentDetail}</p>
            </header>
            <BracketView tournament={tournament} matchGroups={matchGroups} teams={teams} />
        </main>
    );
}
