import { useAuthStore } from '@/store/use-auth-store';
import { useActiveTournament } from '@/store/use-active-tournament-store';
import { useSyncStore } from '@/store/use-sync-store';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useTournamentSync } from './sync/useTournamentSync';
import { useMatchSync } from './sync/useMatchSync';
import { useMatchGroupSync } from './sync/useMatchGroupSync';
import { useTeamSync } from './sync/useTeamSync';

export function useFirestoreSync() {
    const { user } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { isEditing } = useSyncStore();
    const isOnline = useOnlineStatus();

    // 監視の有効/無効を判定
    const shouldSync = isOnline && !isEditing && !!user?.uid && !!activeTournamentId;

    const orgId = user?.uid;
    const tournamentId = activeTournamentId || undefined;

    // 各エンティティの同期フックを実行
    useTournamentSync(orgId, tournamentId, shouldSync);
    useMatchSync(orgId, tournamentId, shouldSync);
    useMatchGroupSync(orgId, tournamentId, shouldSync);
    useTeamSync(orgId, tournamentId, shouldSync);
}

