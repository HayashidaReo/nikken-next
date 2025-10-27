import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を結合する関数
 * clsx + tailwind-merge の組み合わせ
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
 * 反則による得点自動計算
 * 赤反則時に相手の得点を+1する
 */
export function calculateScoreFromHansoku(
    currentScore: number,
    newHansoku: number,
    oldHansoku: number = 0
): number {
    let scoreChange = 0;

    // 赤反則になった場合（2: red, 4: red_red）
    if ((newHansoku === 2 || newHansoku === 4) && oldHansoku < 2) {
        scoreChange += 1;
    }

    // 赤+黄から赤+赤になった場合
    if (newHansoku === 4 && oldHansoku === 3) {
        scoreChange += 1;
    }

    // 反則が戻された場合
    if ((oldHansoku === 2 || oldHansoku === 4) && newHansoku < 2) {
        scoreChange -= 1;
    }

    if (oldHansoku === 4 && newHansoku === 3) {
        scoreChange -= 1;
    }

    return Math.max(0, Math.min(2, currentScore + scoreChange));
}
