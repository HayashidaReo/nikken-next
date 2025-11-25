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
    /**
     * Transaction を使って安全に更新（競合回避）
     * 複数端末での同時編集に対応
     * 最新データを読み取り、差分をマージしてから書き込む
     */
    update(orgId: string, tournamentId: string, matchId: string, patch: Partial<Match>): Promise<Match>;
    /**
     * 同期処理用の上書き保存（Upsert）
     * 存在すれば更新、なければ作成。Transactionは使用しない。
     */
    save(orgId: string, tournamentId: string, match: Match): Promise<Match>;
    delete(orgId: string, tournamentId: string, matchId: string): Promise<void>;
    deleteMultiple(orgId: string, tournamentId: string, matchIds: string[]): Promise<void>;

    // 条件検索
    listByCourtId(orgId: string, tournamentId: string, courtId: string): Promise<Match[]>;
    listByRoundId(orgId: string, tournamentId: string, roundId: string): Promise<Match[]>;
    listByPlayerId(orgId: string, tournamentId: string, playerId: string): Promise<Match[]>;
    listByTeamId(orgId: string, tournamentId: string, teamId: string): Promise<Match[]>;

    /**
     * リアルタイム購読。返り値は解除関数。
     */
    listenAll(orgId: string, tournamentId: string, onChange: (matches: Match[]) => void): () => void;
    listenById(orgId: string, tournamentId: string, matchId: string, onChange: (match: Match | null) => void): () => void;
}

export default MatchRepository;