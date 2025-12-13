import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalMatchGroup, LocalTeamMatch } from '@/lib/db';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { MatchGroupMapper, FirestoreMatchGroupDoc } from '@/data/mappers/match-group-mapper';
import { TeamMatchMapper, FirestoreTeamMatchDoc } from '@/data/mappers/team-match-mapper';
import { useLiveQuery } from 'dexie-react-hooks';
import { uploadMatchGroups } from '@/services/sync/match-group-sync';

export function useMatchGroupSync(orgId: string | undefined, tournamentId: string | undefined, enabled: boolean) {
    // 未送信データの監視と自動送信
    const unsyncedCount = useLiveQuery(async () => {
        if (!orgId || !tournamentId) return 0;
        return await localDB.matchGroups
            .where({ organizationId: orgId, tournamentId })
            .filter(g => g.isSynced === false)
            .count();
    }, [orgId, tournamentId]);

    useEffect(() => {
        if (!enabled || !orgId || !tournamentId || !unsyncedCount) return;

        const sync = async () => {
            try {
                await uploadMatchGroups(orgId, tournamentId);
            } catch (error) {
                console.error("Auto-sync failed for match groups:", error);
            }
        };

        sync();
    }, [enabled, orgId, tournamentId, unsyncedCount]);

    // Firestoreからの受信
    useEffect(() => {
        if (!enabled || !orgId || !tournamentId) return;

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
                                matchGroupId: groupId,
                                id: localTmData?.id,
                            } as LocalTeamMatch);
                        });
                    });
                    teamMatchUnsubs.set(groupId, teamMatchesUnsub);
                }
            });
        });

        return () => {
            groupsUnsub();
            teamMatchUnsubs.forEach(unsub => unsub());
            teamMatchUnsubs.clear();
        };
    }, [enabled, orgId, tournamentId]);
}
