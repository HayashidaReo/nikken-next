import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalTeam } from '@/lib/db';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { TeamMapper, FirestoreTeamDoc } from '@/data/mappers/team-mapper';

export function useTeamSync(orgId: string | undefined, tournamentId: string | undefined, enabled: boolean) {
    useEffect(() => {
        if (!enabled || !orgId || !tournamentId) return;

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

        return () => {
            teamsUnsub();
        };
    }, [enabled, orgId, tournamentId]);
}
