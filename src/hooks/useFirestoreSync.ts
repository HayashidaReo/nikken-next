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
import isEqual from 'lodash/isEqual';

// 比較時に除外するメタデータフィールド
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const omitMetadata = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isSynced, id, _deleted, createdAt, updatedAt, organizationId, tournamentId, ...rest } = data;
    return rest;
};

export function useFirestoreSync() {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { isEditing, setConflict } = useSyncStore();
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

                        // 競合チェック
                        const localData = await localDB.tournaments.get({ organizationId: orgId, tournamentId });
                        if (localData && !localData.isSynced) {
                            // オフライン編集後の初回同期（added）は、サーバーデータが古いため無視する
                            // これにより、自分の編集内容が「競合」として扱われるのを防ぐ
                            if (change.type === 'added') return;

                            // メタデータとタイムスタンプを除外して比較
                            if (isEqual(omitMetadata(localData), omitMetadata(domainData))) {
                                await localDB.tournaments.update(localData.tournamentId, { isSynced: true });
                            } else {
                                setConflict({
                                    collection: FIRESTORE_COLLECTIONS.TOURNAMENTS,
                                    id: tournamentId,
                                    localData,
                                    cloudData: domainData
                                });
                            }
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
                    // オフライン編集後の初回同期（added）は無視
                    if (change.type === 'added') return;

                    // メタデータとタイムスタンプを除外して比較
                    if (isEqual(omitMetadata(localData), omitMetadata(domainData))) {
                        await localDB.matches.update(localData.id!, { isSynced: true });
                    } else {
                        setConflict({
                            collection: FIRESTORE_COLLECTIONS.MATCHES,
                            id,
                            localData,
                            cloudData: domainData
                        });
                    }
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
                    // オフライン編集後の初回同期（added）は無視
                    if (change.type === 'added') return;

                    // メタデータとタイムスタンプを除外して比較
                    if (isEqual(omitMetadata(localGroupData), omitMetadata(domainGroupData))) {
                        await localDB.matchGroups.update(localGroupData.id!, { isSynced: true });
                    } else {
                        setConflict({
                            collection: FIRESTORE_COLLECTIONS.MATCH_GROUPS,
                            id: groupId,
                            localData: localGroupData,
                            cloudData: domainGroupData
                        });
                    }
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
                            if (localTmData && !localTmData.isSynced) {
                                // オフライン編集後の初回同期（added）は無視
                                if (tmChange.type === 'added') return;

                                // メタデータとタイムスタンプを除外して比較
                                if (isEqual(omitMetadata(localTmData), omitMetadata(domainTmData))) {
                                    await localDB.teamMatches.update(localTmData.id!, { isSynced: true });
                                } else {
                                    setConflict({
                                        collection: FIRESTORE_COLLECTIONS.TEAM_MATCHES,
                                        id: tmId,
                                        localData: localTmData,
                                        cloudData: domainTmData
                                    });
                                }
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
                    // オフライン編集後の初回同期（added）は無視
                    if (change.type === 'added') return;

                    // メタデータとタイムスタンプを除外して比較
                    if (isEqual(omitMetadata(localData), omitMetadata(domainData))) {
                        await localDB.teams.update(localData.id!, { isSynced: true });
                    } else {
                        setConflict({
                            collection: FIRESTORE_COLLECTIONS.TEAMS,
                            id,
                            localData,
                            cloudData: domainData
                        });
                    }
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
