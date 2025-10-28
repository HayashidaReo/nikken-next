import { v4 as uuidv4 } from "uuid";
import type { PlayerRegistrationData } from "@/components/molecules/confirmation-dialog";
import type { TeamCreate, Player } from "@/types/team.schema";
import { DisplayNameService } from "@/domains/team/services/display-name.service";

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
            const fullName = player.fullName.trim();
            const nameParts = fullName.split(/\s+/);

            // 最初の部分を姓、残りを名として結合
            const lastName = nameParts[0];
            const firstName = nameParts.slice(1).join(" ");

            return {
                playerId: `player_${uuidv4()}`,
                lastName,
                firstName,
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

        formData.players.forEach((player, index) => {
            const fullName = player.fullName.trim();
            if (!fullName) {
                errors.push(`選手${index + 1}: 選手名は必須です`);
            } else {
                const nameParts = fullName.split(/\s+/);
                if (nameParts.length < 2 || nameParts.some(part => part.length === 0)) {
                    errors.push(`選手${index + 1}: 選手名は「姓 名」の形式で入力してください`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * プレビュー用: 変換後のデータを表示用に整形
     */
    static previewConversion(formData: PlayerRegistrationData) {
        try {
            const teamCreate = this.toTeamCreate(formData);
            return {
                success: true,
                data: {
                    teamName: teamCreate.teamName,
                    representativeName: teamCreate.representativeName,
                    playersCount: teamCreate.players.length,
                    players: teamCreate.players.map(p => ({
                        displayName: p.displayName,
                        fullName: `${p.lastName} ${p.firstName}`,
                    })),
                    remarks: teamCreate.remarks,
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "変換エラーが発生しました",
            };
        }
    }
}