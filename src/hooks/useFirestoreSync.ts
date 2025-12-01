import { TournamentMapper, FirestoreTournamentDoc } from '@/data/mappers/tournament-mapper';
import { MatchMapper, FirestoreMatchDoc } from '@/data/mappers/match-mapper';
import { MatchGroupMapper, FirestoreMatchGroupDoc } from '@/data/mappers/match-group-mapper';
import { TeamMatchMapper, FirestoreTeamMatchDoc } from '@/data/mappers/team-match-mapper';
import { TeamMapper, FirestoreTeamDoc } from '@/data/mappers/team-mapper';
import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam, LocalTournament } from '@/lib/db';
import { useAuthStore } from '@/store/use-auth-store';
import { useActiveTournament } from '@/store/use-active-tournament-store';
import { useSyncStore } from '@/store/use-sync-store';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';

export function useFirestoreSync() {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { isEditing } = useSyncStore();
    const isOnline = useOnlineStatus();

    // 監視の有効/無効を判定
    const shouldSync = isOnline && !isEditing && !!user?.uid && !!activeTournamentId;

    useEffect(() => {
        if (!shouldSync || !user?.uid || !activeTournamentId) return;

        const orgId = user.uid;
        const tournamentId = activeTournamentId;

        // 各コレクションの監視設定
        const unsubs: (() => void)[] = [];

        // 1. Tournaments
        const tournamentUnsub = onSnapshot(
            collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}`),
            (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.doc.id !== tournamentId) return;

                    const data = change.doc.data() as FirestoreTournamentDoc;
                    if (change.type === 'modified' || change.type === 'added') {
                        // Mapperを使用して変換
                        const domainData = TournamentMapper.toDomain({ ...data, id: change.doc.id });

                        // ローカルデータの確認
                        const localData = await localDB.tournaments.get({ organizationId: orgId, tournamentId });

                        // 未送信データがある場合は、クラウドからの更新を無視する（ローカル優先）
                        if (localData && !localData.isSynced) {
                            return;
                        }

                        // 上書き保存
                        await localDB.tournaments.put({
                            ...domainData,
                            organizationId: orgId,
                            tournamentId,
                            isSynced: true
                        } as LocalTournament);
                    }
                });
            }
        );
        unsubs.push(tournamentUnsub);

        // 2. Matches
        const matchesQuery = query(collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCHES}`));
        const matchesUnsub = onSnapshot(matchesQuery, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const data = change.doc.data() as FirestoreMatchDoc;
                const id = change.doc.id;

                if (change.type === 'removed') {
                    await localDB.matches.where({ matchId: id }).delete();
                    return;
                }

                // Mapperを使用して変換
                const domainData = MatchMapper.toDomain({ ...data, id });

                const localData = await localDB.matches.where({ matchId: id }).first();

                // 未送信データがある場合は、クラウドからの更新を無視する（ローカル優先）
                if (localData && !localData.isSynced) {
                    return;
                }

                // 上書き保存
                await localDB.matches.put({
                    ...domainData,
                    organizationId: orgId,
                    tournamentId,
                    isSynced: true,
                    id: localData?.id,
                } as LocalMatch);
            });
        });
        unsubs.push(matchesUnsub);

        // 4. TeamMatches (SubCollection of MatchGroups)
        const teamMatchUnsubs = new Map<string, () => void>();

        const groupsQuery = query(collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCH_GROUPS}`));
        const groupsUnsub = onSnapshot(groupsQuery, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const groupData = change.doc.data() as FirestoreMatchGroupDoc;
                const groupId = change.doc.id;

                if (change.type === 'removed') {
                    await localDB.matchGroups.where({ matchGroupId: groupId }).delete();
                    await localDB.teamMatches.where({ matchGroupId: groupId }).delete();

                    const unsub = teamMatchUnsubs.get(groupId);
                    if (unsub) {
                        unsub();
                        teamMatchUnsubs.delete(groupId);
                    }
                    return;
                }

                // Mapperを使用して変換
                const domainGroupData = MatchGroupMapper.toDomain({ ...groupData, id: groupId });

                const localGroupData = await localDB.matchGroups.where({ matchGroupId: groupId }).first();

                // 未送信データがある場合は、クラウドからの更新を無視する（ローカル優先）
                if (localGroupData && !localGroupData.isSynced) {
                    // 何もしない
                } else {
                    // 上書き保存
                    await localDB.matchGroups.put({
                        ...domainGroupData,
                        organizationId: orgId,
                        tournamentId,
                        isSynced: true,
                        id: localGroupData?.id,
                    } as LocalMatchGroup);
                }

                if (!teamMatchUnsubs.has(groupId)) {
                    const teamMatchesQuery = query(collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCH_GROUPS}/${groupId}/${FIRESTORE_COLLECTIONS.TEAM_MATCHES}`));
                    const teamMatchesUnsub = onSnapshot(teamMatchesQuery, (tmSnapshot) => {
                        tmSnapshot.docChanges().forEach(async (tmChange) => {
                            const tmData = tmChange.doc.data() as FirestoreTeamMatchDoc;
                            const tmId = tmChange.doc.id;

                            if (tmChange.type === 'removed') {
                                await localDB.teamMatches.where({ matchId: tmId }).delete();
                                return;
                            }

                            // Mapperを使用して変換
                            const domainTmData = TeamMatchMapper.toDomain({ ...tmData, id: tmId });

                            const localTmData = await localDB.teamMatches.where({ matchId: tmId }).first();

                            // 未送信データがある場合は、クラウドからの更新を無視する（ローカル優先）
                            if (localTmData && !localTmData.isSynced) {
                                return;
                            }

                            // 上書き保存
                            await localDB.teamMatches.put({
                                ...domainTmData,
                                organizationId: orgId,
                                tournamentId,
                                isSynced: true,
                                id: localTmData?.id,
                                matchGroupId: groupId,
                            } as LocalTeamMatch);
                        });
                    });
                    teamMatchUnsubs.set(groupId, teamMatchesUnsub);
                }
            });
        });
        unsubs.push(groupsUnsub);

        // 5. Teams
        const teamsQuery = query(collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.TEAMS}`));
        const teamsUnsub = onSnapshot(teamsQuery, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const data = change.doc.data() as FirestoreTeamDoc;
                const id = change.doc.id;

                if (change.type === 'removed') {
                    await localDB.teams.where({ teamId: id }).delete();
                    return;
                }

                // Mapperを使用して変換
                const domainData = TeamMapper.toDomain({ ...data, id });

                const localData = await localDB.teams.where({ teamId: id }).first();

                // 未送信データがある場合は、クラウドからの更新を無視する（ローカル優先）
                if (localData && !localData.isSynced) {
                    return;
                }

                // 上書き保存
                await localDB.teams.put({
                    ...domainData,
                    organizationId: orgId,
                    tournamentId,
                    isSynced: true,
                    id: localData?.id,
                } as LocalTeam);
            });
        });
        unsubs.push(teamsUnsub);

        // クリーンアップ
        return () => {
            unsubs.forEach(unsub => unsub());
            teamMatchUnsubs.forEach(unsub => unsub());
            teamMatchUnsubs.clear();
        };
    }, [shouldSync, user?.uid, activeTournamentId]);
}
