import type { Team, TeamCreate } from "@/types/team.schema";

/**
 * Team リポジトリの抽象インターフェース
 * 組織・大会階層構造に対応
 */
export interface TeamRepository {
  getById(orgId: string, tournamentId: string, teamId: string): Promise<Team | null>;
  listAll(orgId: string, tournamentId: string): Promise<Team[]>;
  create(orgId: string, tournamentId: string, team: TeamCreate): Promise<Team>;
  update(orgId: string, tournamentId: string, teamId: string, patch: Partial<Team>): Promise<Team>;
  delete(orgId: string, tournamentId: string, teamId: string): Promise<void>;
  /**
   * リアルタイム購読。返り値は解除関数。
   */
  listenAll(orgId: string, tournamentId: string, onChange: (teams: Team[]) => void): () => void;
}

export default TeamRepository;
