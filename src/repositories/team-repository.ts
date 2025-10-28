import type { Team, TeamCreate } from "@/types/team.schema";

/**
 * Team リポジトリの抽象インターフェース
 */
export interface TeamRepository {
    getById(teamId: string): Promise<Team | null>;
    listAll(): Promise<Team[]>;
    create(team: TeamCreate): Promise<Team>;
    update(teamId: string, patch: Partial<Team>): Promise<Team>;
    delete(teamId: string): Promise<void>;
    /**
     * リアルタイム購読。返り値は解除関数。
     */
    listenAll(onChange: (teams: Team[]) => void): () => void;
}

export default TeamRepository;
