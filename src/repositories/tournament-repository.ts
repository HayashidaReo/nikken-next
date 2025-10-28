import { Tournament, TournamentCreate } from "@/types/tournament.schema";

/**
 * Tournament エンティティに対する抽象化されたリポジトリインターフェース
 * 
 * 実装: FirestoreTournamentRepository
 */
export interface TournamentRepository {
    /**
     * 指定したIDの大会を取得する
     */
    getById(tournamentId: string): Promise<Tournament | null>;

    /**
     * 全ての大会を一覧取得する（作成日の新しい順）
     */
    listAll(): Promise<Tournament[]>;

    /**
     * 新しい大会を作成する
     */
    create(tournament: TournamentCreate): Promise<Tournament>;

    /**
     * 大会を更新する
     */
    update(tournamentId: string, patch: Partial<Tournament>): Promise<Tournament>;

    /**
     * 大会を削除する
     */
    delete(tournamentId: string): Promise<void>;

    /**
     * リアルタイムで全大会の変更を購読する
     */
    listenAll(callback: (tournaments: Tournament[]) => void): () => void;
}