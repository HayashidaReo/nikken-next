import { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';
import { db as localDB, LocalTournament } from '@/lib/db';
import { FIRESTORE_COLLECTIONS } from '@/lib/constants';
import { TournamentMapper, FirestoreTournamentDoc } from '@/data/mappers/tournament-mapper';

export function useTournamentSync(orgId: string | undefined, tournamentId: string | undefined, enabled: boolean) {
    useEffect(() => {
        if (!enabled || !orgId || !tournamentId) return;

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

        return () => {
            tournamentUnsub();
        };
    }, [enabled, orgId, tournamentId]);
}
