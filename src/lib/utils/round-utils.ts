/**
 * ラウンドIDと名称を扱うユーティリティ関数
 */
export interface RoundSummary {
    roundId: string;
    roundName: string;
}

/**
 * ラウンドIDから名称を解決する。見つからない場合はIDをそのまま返す。
 */
export function findRoundName(roundId?: string, rounds?: RoundSummary[] | null): string {
    if (!roundId) {
        return "";
    }

    if (!rounds || rounds.length === 0) {
        return roundId;
    }

    const round = rounds.find((r) => r.roundId === roundId);
    return round ? round.roundName : roundId;
}

/**
 * 有効なラウンド配列のみを返し、なければ空配列にフォールバックする。
 */
export function getValidRounds(rounds?: RoundSummary[] | null): RoundSummary[] {
    return rounds && Array.isArray(rounds) && rounds.length > 0 ? rounds : [];
}
