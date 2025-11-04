import type { Match, MatchCreate } from "@/types/match.schema";

/**
 * Match リポジトリの抽象インターフェース
 * 組織・大会階層構造に対応
 */
export interface MatchRepository {
    getById(orgId: string, tournamentId: string, matchId: string): Promise<Match | null>;
    listAll(orgId: string, tournamentId: string): Promise<Match[]>;
    create(orgId: string, tournamentId: string, match: MatchCreate): Promise<Match>;
    createMultiple(orgId: string, tournamentId: string, matches: MatchCreate[]): Promise<Match[]>;
    update(orgId: string, tournamentId: string, matchId: string, patch: Partial<Match>): Promise<Match>;
    delete(orgId: string, tournamentId: string, matchId: string): Promise<void>;
    deleteMultiple(orgId: string, tournamentId: string, matchIds: string[]): Promise<void>;

    // 条件検索
    listByCourtId(orgId: string, tournamentId: string, courtId: string): Promise<Match[]>;
    listByRound(orgId: string, tournamentId: string, round: string): Promise<Match[]>;
    listByPlayerId(orgId: string, tournamentId: string, playerId: string): Promise<Match[]>;
    listByTeamId(orgId: string, tournamentId: string, teamId: string): Promise<Match[]>;

    /**
     * リアルタイム購読。返り値は解除関数。
     */
    listenAll(orgId: string, tournamentId: string, onChange: (matches: Match[]) => void): () => void;
    listenById(orgId: string, tournamentId: string, matchId: string, onChange: (match: Match | null) => void): () => void;
}

export default MatchRepository;