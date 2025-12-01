import { TournamentMapper, FirestoreTournamentDoc } from '@/data/mappers/tournament-mapper';
import { MatchMapper, FirestoreMatchDoc } from '@/data/mappers/match-mapper';
import { MatchGroupMapper, FirestoreMatchGroupDoc } from '@/data/mappers/match-group-mapper';
import { TeamMatchMapper, FirestoreTeamMatchDoc } from '@/data/mappers/team-match-mapper';
import { TeamMapper, FirestoreTeamDoc } from '@/data/mappers/team-mapper';
import { useEffect, useRef } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam, LocalTournament } from '@/lib/db';
import { useAuthStore } from '@/store/use-auth-store';
import { useActiveTournament } from '@/store/use-active-tournament-store';
import { useSyncStore } from '@/store/use-sync-store';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { syncService } from '@/services/sync-service';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';

export function useFirestoreSync() {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { isEditing, setConflict } = useSyncStore();
    const isOnline = useOnlineStatus();

    // 監視の有効/無効を判定
    const shouldSync = isOnline && !isEditing && !!user?.uid && !!activeTournamentId;

    // 前回の同期状態を保持して、再開時に再取得を行うためのRef
    const wasSyncingRef = useRef(shouldSync);

    useEffect(() => {
        // 同期が無効 -> 有効になったタイミングで、一度手動で全件取得（再開時の同期）
        if (!wasSyncingRef.current && shouldSync && user?.uid && activeTournamentId) {
            syncService.downloadTournamentData(user.uid, activeTournamentId).catch(console.error);
        }
        wasSyncingRef.current = shouldSync;
    }, [shouldSync, user?.uid, activeTournamentId]);

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

                        // 競合チェック
                        const localData = await localDB.tournaments.get({ organizationId: orgId, tournamentId });
                        if (localData && !localData.isSynced) {
                            setConflict({
                                collection: 'tournaments',
                                id: tournamentId,
                                localData,
                                cloudData: domainData
                            });
                        } else {
                            await localDB.tournaments.put({
                                ...domainData,
                                organizationId: orgId,
                                tournamentId,
                                isSynced: true
                            } as LocalTournament);
                        }
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
                if (localData && !localData.isSynced) {
                    setConflict({
                        collection: 'matches',
                        id,
                        localData,
                        cloudData: domainData
                    });
                } else {
                    await localDB.matches.put({
                        ...domainData,
                        organizationId: orgId,
                        tournamentId,
                        isSynced: true,
                        id: localData?.id,
                    } as LocalMatch);
                }
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
                if (localGroupData && !localGroupData.isSynced) {
                    setConflict({
                        collection: 'matchGroups',
                        id: groupId,
                        localData: localGroupData,
                        cloudData: domainGroupData
                    });
                } else {
                    await localDB.matchGroups.put({
                        ...domainGroupData,
                        organizationId: orgId,
                        tournamentId,
                        isSynced: true,
                        id: localGroupData?.id,
                    } as LocalMatchGroup);
                }

                if (!teamMatchUnsubs.has(groupId)) {
                    const teamMatchesQuery = query(collection(firestore, `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCH_GROUPS}/${groupId}/${FIRESTORE_COLLECTIONS.MATCHES}`));
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
                            if (localTmData && !localTmData.isSynced) {
                                setConflict({
                                    collection: 'teamMatches',
                                    id: tmId,
                                    localData: localTmData,
                                    cloudData: domainTmData
                                });
                            } else {
                                await localDB.teamMatches.put({
                                    ...domainTmData,
                                    organizationId: orgId,
                                    tournamentId,
                                    isSynced: true,
                                    id: localTmData?.id,
                                    matchGroupId: groupId,
                                } as LocalTeamMatch);
                            }
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
                if (localData && !localData.isSynced) {
                    setConflict({
                        collection: 'teams',
                        id,
                        localData,
                        cloudData: domainData
                    });
                } else {
                    await localDB.teams.put({
                        ...domainData,
                        organizationId: orgId,
                        tournamentId,
                        isSynced: true,
                        id: localData?.id,
                    } as LocalTeam);
                }
            });
        });
        unsubs.push(teamsUnsub);

        // クリーンアップ
        return () => {
            unsubs.forEach(unsub => unsub());
            teamMatchUnsubs.forEach(unsub => unsub());
            teamMatchUnsubs.clear();
        };
    }, [shouldSync, user?.uid, activeTournamentId, setConflict]);
}
