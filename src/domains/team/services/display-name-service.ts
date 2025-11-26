
interface PlayerName {
    lastName: string;
    firstName: string;
    displayName?: string;
}

/**
 * 選手リストから表示名を自動生成する
 * 
 * ルール:
 * 1. 姓が重複しない場合 -> 姓のみ
 * 2. 姓が重複する場合 -> 姓 + 名の1文字目
 * 3. 姓 + 名の1文字目も重複する場合 -> 姓 + 名（フルネーム）
 * 
 * @param players 選手リスト
 * @returns 表示名が更新された選手リスト（インデックスと新しい表示名のペアの配列）
 */
export function generateDisplayNames(players: PlayerName[]): { index: number; displayName: string }[] {
    const updates: { index: number; displayName: string }[] = [];

    // 姓でグループ化
    const lastNameGroups: { [key: string]: number[] } = {};
    players.forEach((player, index) => {
        const lastName = player.lastName || "";
        if (!lastNameGroups[lastName]) {
            lastNameGroups[lastName] = [];
        }
        lastNameGroups[lastName].push(index);
    });

    // displayNameを決定
    Object.entries(lastNameGroups).forEach(([lastName, indices]) => {
        if (indices.length === 1) {
            // 重複なし：姓のみ
            const idx = indices[0];
            const current = players[idx]?.displayName || "";
            if (current !== lastName) {
                updates.push({ index: idx, displayName: lastName });
            }
        } else {
            // 重複あり：姓 + 名の一部
            indices.forEach(index => {
                const player = players[index] || { firstName: "", displayName: "" };
                const firstName = player.firstName || "";
                let displayName = `${lastName} ${firstName.charAt(0)}`;

                // 同じ姓＋名の一部でも重複する場合はフルネーム
                const sameDisplay = indices.filter(i => {
                    const otherPlayer = players[i] || { firstName: "" };
                    return `${lastName} ${otherPlayer.firstName.charAt(0)}` === displayName;
                });

                if (sameDisplay.length > 1) {
                    displayName = `${lastName} ${firstName}`;
                }

                const current = player.displayName || "";
                if (current !== displayName) {
                    updates.push({ index, displayName });
                }
            });
        }
    });

    return updates;
}
