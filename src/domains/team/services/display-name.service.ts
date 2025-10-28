import type { Player } from "@/types/team.schema";

/**
 * displayName生成ドメインサービス
 * 要件定義書の「displayNameの作成方法」ロジックを実装
 */
export class DisplayNameService {
    /**
     * チーム全体の選手のdisplayNameを生成
     * 
     * ロジック:
     * 1. まず、全選手のdisplayNameを「姓」で初期設定
     * 2. 次に、チーム内で「姓」が重複している選手グループを探す
     * 3. 重複グループが見つかった場合、そのグループの選手全員のdisplayNameを「姓 + 半角スペース + 名の一部」に変更
     * 
     * @param players - チームの選手リスト
     * @returns displayNameが設定された選手リスト
     */
    static generateDisplayNames(players: Player[]): Player[] {
        // 1. まず全選手を姓のみで初期化
        const playersWithDisplayName = players.map(player => ({
            ...player,
            displayName: player.lastName,
        }));

        // 2. 姓でグループ化
        const lastNameGroups = this.groupByLastName(playersWithDisplayName);

        // 3. 重複する姓のグループを処理
        for (const [, playersInGroup] of lastNameGroups.entries()) {
            if (playersInGroup.length > 1) {
                // 重複がある場合、名前の一部を追加
                this.resolveNameConflicts(playersInGroup);
            }
        }

        return playersWithDisplayName;
    }

    /**
     * 姓でプレイヤーをグループ化
     */
    private static groupByLastName(players: Player[]): Map<string, Player[]> {
        const groups = new Map<string, Player[]>();

        for (const player of players) {
            const existing = groups.get(player.lastName) || [];
            existing.push(player);
            groups.set(player.lastName, existing);
        }

        return groups;
    }

    /**
     * 名前の重複を解決
     * 名前の一部を段階的に追加して重複を解決
     */
    private static resolveNameConflicts(players: Player[]): void {
        let maxNameLength = 1;
        let resolved = false;

        while (!resolved && maxNameLength <= this.getMaxFirstNameLength(players)) {
            const displayNames = new Set<string>();
            let hasConflict = false;

            for (const player of players) {
                const namePart = this.getFirstNamePart(player.firstName, maxNameLength);
                const candidateDisplayName = `${player.lastName} ${namePart}`;

                if (displayNames.has(candidateDisplayName)) {
                    hasConflict = true;
                    break;
                }

                displayNames.add(candidateDisplayName);
            }

            if (!hasConflict) {
                // 重複が解決された場合、displayNameを更新
                for (const player of players) {
                    const namePart = this.getFirstNamePart(player.firstName, maxNameLength);
                    player.displayName = `${player.lastName} ${namePart}`;
                }
                resolved = true;
            } else {
                maxNameLength++;
            }
        }

        // まだ解決されていない場合、フルネームを使用
        if (!resolved) {
            for (const player of players) {
                player.displayName = `${player.lastName} ${player.firstName}`;
            }
        }
    }

    /**
     * 名前の指定された長さの部分を取得
     */
    private static getFirstNamePart(firstName: string, length: number): string {
        return firstName.substring(0, length);
    }

    /**
     * グループ内の最大名前長を取得
     */
    private static getMaxFirstNameLength(players: Player[]): number {
        return Math.max(...players.map(player => player.firstName.length));
    }

    /**
     * 単一プレイヤーのdisplayNameを生成（他のプレイヤーとの比較用）
     */
    static generateSingleDisplayName(
        player: Player,
        otherPlayers: Player[]
    ): string {
        const sameLastNamePlayers = otherPlayers.filter(
            p => p.lastName === player.lastName && p.playerId !== player.playerId
        );

        if (sameLastNamePlayers.length === 0) {
            return player.lastName;
        }

        // 重複がある場合の処理
        const allPlayers = [player, ...sameLastNamePlayers];
        const processed = this.generateDisplayNames(allPlayers);
        const result = processed.find(p => p.playerId === player.playerId);

        return result?.displayName || player.lastName;
    }
}