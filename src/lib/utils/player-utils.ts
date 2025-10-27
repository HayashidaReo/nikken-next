/**
 * 選手バリアントの型定義
 */
export type PlayerVariant = "red" | "white";

/**
 * displayNameを生成するロジック（Cloud Function用）
 * 同姓の選手がいる場合は名の一部も含める
 */
export function generateDisplayNames(
    players: Array<{ lastName: string; firstName: string }>
): Array<{ lastName: string; firstName: string; displayName: string }> {
    const result = players.map(player => ({
        ...player,
        displayName: player.lastName, // 初期値は姓のみ
    }));

    // 姓でグループ化
    const lastNameGroups = new Map<string, typeof result>();
    result.forEach(player => {
        const group = lastNameGroups.get(player.lastName) || [];
        group.push(player);
        lastNameGroups.set(player.lastName, group);
    });

    // 重複がある場合の処理
    lastNameGroups.forEach(group => {
        if (group.length > 1) {
            // 同姓が複数いる場合
            const firstNameCounts = new Map<string, number>();

            // 名の最初の文字でカウント
            group.forEach(player => {
                const firstChar = player.firstName.charAt(0);
                firstNameCounts.set(
                    firstChar,
                    (firstNameCounts.get(firstChar) || 0) + 1
                );
            });

            group.forEach(player => {
                const firstChar = player.firstName.charAt(0);
                if (firstNameCounts.get(firstChar)! > 1) {
                    // 名の最初の文字も重複している場合はフルネーム
                    player.displayName = `${player.lastName} ${player.firstName}`;
                } else {
                    // 名の最初の文字で区別できる場合
                    player.displayName = `${player.lastName} ${firstChar}`;
                }
            });
        }
    });

    return result;
}

/**
 * 選手バリアントに応じたスタイルクラスを取得
 */
export const getPlayerVariantStyles = (variant: PlayerVariant) => {
    const styles = {
        red: {
            background: "bg-gradient-to-br from-red-600 to-red-800",
            text: "text-white",
            accent: "text-red-100"
        },
        white: {
            background: "bg-gradient-to-br from-gray-300 to-gray-400",
            text: "text-black",
            accent: "text-gray-700"
        }
    };

    return styles[variant];
};

/**
 * 選手バリアントに応じた表示名を取得
 */
export const getPlayerDisplayName = (variant: PlayerVariant, playerName?: string): string => {
    const defaultNames = {
        red: "選手A",
        white: "選手B"
    };

    return playerName || defaultNames[variant];
};

/**
 * 選手の位置設定を取得（上から/下からの配置）
 */
export const getPlayerPositionClass = (variant: PlayerVariant): string => {
    return variant === "red"
        ? "absolute top-5 right-16"
        : "absolute bottom-5 right-16";
};