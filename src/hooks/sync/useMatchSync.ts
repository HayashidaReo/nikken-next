import { useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalMatch } from '@/lib/db';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { MatchMapper, FirestoreMatchDoc } from '@/data/mappers/match-mapper';

export function useMatchSync(orgId: string | undefined, tournamentId: string | undefined, enabled: boolean) {
    useEffect(() => {
        if (!enabled || !orgId || !tournamentId) return;

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

        return () => {
            matchesUnsub();
        };
    }, [enabled, orgId, tournamentId]);
}
