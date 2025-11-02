import { v4 as uuidv4 } from "uuid";
import type { TeamFormData } from "@/types/team-form.schema";
import type { TeamCreate, Player } from "@/types/team.schema";
import { DisplayNameService } from "@/domains/team/services/display-name.service";
import { splitPlayerName, validatePlayerNames } from "@/lib/utils/player-name-utils";
import { teamFormSchema } from "@/types/team-form.schema";

/**
 * チーム登録フォームのデータをFirestore用のTeamCreateに変換
 */
export class TeamFormConverter {
    /**
     * TeamFormDataをTeamCreateに変換
     */
    static toTeamCreate(formData: TeamFormData): TeamCreate {
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
    static validateFormData(formData: TeamFormData): {
        isValid: boolean;
        errors: string[]
    } {
        // Zod スキーマで検証して、エラーメッセージを集約する
        const result = teamFormSchema.safeParse(formData);
        if (result.success) {
            return { isValid: true, errors: [] };
        }

        // Zod の error からメッセージをフラット化して返す
        const messages: string[] = result.error.issues.map((issue) => {
            return issue.message;
        });

        const invalidPlayerIndices = validatePlayerNames(formData.players.map((p) => p.fullName));
        invalidPlayerIndices.forEach((index) => {
            const fullName = formData.players[index].fullName.trim();
            if (!fullName) {
                messages.push(`選手${index + 1}: 選手名は必須です`);
            } else {
                messages.push(`選手${index + 1}: 選手名は「姓 名」の形式で入力してください`);
            }
        });

        return { isValid: false, errors: Array.from(new Set(messages)) };
    }
}