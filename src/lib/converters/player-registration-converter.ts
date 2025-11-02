import { v4 as uuidv4 } from "uuid";
import type { PlayerRegistrationData } from "@/types/player-registration.schema";
import type { TeamCreate, Player } from "@/types/team.schema";
import { DisplayNameService } from "@/domains/team/services/display-name.service";
import { splitPlayerName, validatePlayerNames } from "@/lib/utils/player-name-utils";

/**
 * 選手登録フォームのデータをFirestore用のTeamCreateに変換
 */
export class PlayerRegistrationConverter {
    /**
     * PlayerRegistrationDataをTeamCreateに変換
     */
    static toTeamCreate(formData: PlayerRegistrationData): TeamCreate {
        // フォームの選手データ（fullName）を姓名に分割してPlayerオブジェクトに変換
        const players: Player[] = formData.players.map((player) => {
            const nameResult = splitPlayerName(player.fullName);

            return {
                playerId: `player_${uuidv4()}`,
                lastName: nameResult.lastName,
                firstName: nameResult.firstName,
                displayName: "", // 初期値（DisplayNameServiceで後から生成）
            };
        });

        // displayName を生成
        const playersWithDisplayNames = DisplayNameService.generateDisplayNames(players);

        const teamCreate: TeamCreate = {
            teamName: formData.teamName,
            representativeName: formData.representativeName,
            representativePhone: formData.representativePhone,
            representativeEmail: formData.representativeEmail,
            players: playersWithDisplayNames,
            remarks: formData.remarks,
            isApproved: false, // 初期状態は未承認
        };

        return teamCreate;
    }

    /**
     * バリデーション: フォームデータが有効かチェック
     */
    static validateFormData(formData: PlayerRegistrationData): {
        isValid: boolean;
        errors: string[]
    } {
        const errors: string[] = [];

        // 必須フィールドのチェック
        if (!formData.teamName.trim()) {
            errors.push("チーム名は必須です");
        }
        if (!formData.representativeName.trim()) {
            errors.push("代表者名は必須です");
        }
        if (!formData.representativePhone.trim()) {
            errors.push("代表者電話番号は必須です");
        }
        if (!formData.representativeEmail.trim()) {
            errors.push("代表者メールアドレスは必須です");
        }

        // 選手データのチェック
        if (formData.players.length === 0) {
            errors.push("最低1人の選手を登録してください");
        }

        // 選手名バリデーション
        const invalidPlayerIndices = validatePlayerNames(formData.players.map(p => p.fullName));
        invalidPlayerIndices.forEach(index => {
            const fullName = formData.players[index].fullName.trim();
            if (!fullName) {
                errors.push(`選手${index + 1}: 選手名は必須です`);
            } else {
                errors.push(`選手${index + 1}: 選手名は「姓 名」の形式で入力してください`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}