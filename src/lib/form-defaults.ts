import type { TeamFormData } from "@/types/team-form.schema";
import type { OrganizationCreateWithAccount } from "@/types/organization.schema";
import { z } from "zod";

// 大会設定フォーム用のスキーマ（tournament-settings-form.tsx から）
export const tournamentSettingsSchema = z.object({
  tournamentName: z.string().min(1, "大会名は必須です"),
  tournamentDate: z.string().min(1, "開催日は必須です"), // フォームでは文字列として扱う
  location: z.string().min(1, "開催場所は必須です"),
  defaultMatchTimeMinutes: z
    .number()
    .min(1, "試合時間は1分以上で設定してください"),
  defaultMatchTimeSeconds: z
    .number()
    .min(0)
    .max(59, "秒は0-59の範囲で入力してください"),
  courts: z
    .array(
      z.object({
        courtId: z.string(),
        courtName: z.string().min(1, "コート名は必須です"),
      })
    )
    .min(1, "最低1つのコートを設定してください"),
});

export type TournamentSettingsData = z.infer<typeof tournamentSettingsSchema>;

// チーム編集フォーム用のスキーマ（team-edit-form.tsx から）
export const teamEditSchema = z.object({
  teamName: z.string().min(1, "チーム名は必須です"),
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "電話番号は必須です"),
  representativeEmail: z
    .string()
    .email("正しいメールアドレスを入力してください"),
  isApproved: z.boolean(),
  remarks: z.string(),
  players: z.array(
    z.object({
      playerId: z.string(),
      lastName: z.string().min(1, "姓は必須です"),
      firstName: z.string().min(1, "名は必須です"),
      displayName: z.string(),
    })
  ),
});

export type TeamEditData = z.infer<typeof teamEditSchema>;

/**
 * チーム登録フォームのデフォルト値
 */
export const defaultTeamFormValues: TeamFormData = {
  representativeName: "",
  representativePhone: "",
  representativeEmail: "",
  teamName: "",
  players: [{ fullName: "" }],
  remarks: "",
};

/**
 * トーナメント設定フォームのデフォルト値を作成する関数
 * @param tournament 既存のトーナメントデータ（編集時）
 * @param defaultMinutes デフォルトの試合時間（分）
 * @param defaultSeconds デフォルトの試合時間（秒）
 */
export function createDefaultTournamentSettingsValues(
  tournament?: {
    tournamentName?: string;
    tournamentDate?: Date;
    location?: string;
    courts?: Array<{ courtId: string; courtName: string }>;
  } | null,
  defaultMinutes: number = 5,
  defaultSeconds: number = 0
): Partial<TournamentSettingsData> {
  return {
    tournamentName: tournament?.tournamentName || "",
    tournamentDate: tournament?.tournamentDate instanceof Date
      ? tournament.tournamentDate.toISOString().split('T')[0]
      : "",
    location: tournament?.location || "",
    defaultMatchTimeMinutes: defaultMinutes,
    defaultMatchTimeSeconds: defaultSeconds,
    courts: tournament?.courts?.map(court => ({
      courtId: court.courtId,
      courtName: court.courtName,
    })) || [{ courtId: "court-1", courtName: "" }],
  };
}

/**
 * チーム編集フォームのデフォルト値を作成する関数
 * @param team 既存のチームデータ
 */
export function createDefaultTeamEditValues(team: {
  teamName: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  isApproved: boolean;
  remarks?: string;
  players: Array<{
    playerId: string;
    lastName: string;
    firstName: string;
    displayName: string;
  }>;
}): TeamEditData {
  return {
    teamName: team.teamName,
    representativeName: team.representativeName,
    representativePhone: team.representativePhone,
    representativeEmail: team.representativeEmail,
    isApproved: team.isApproved,
    remarks: team.remarks || "",
    players: team.players.map(player => ({
      playerId: player.playerId,
      lastName: player.lastName,
      firstName: player.firstName,
      displayName: player.displayName,
    })),
  };
}

/**
 * 組織作成フォームのデフォルト値
 */
export const defaultOrganizationCreateValues: OrganizationCreateWithAccount = {
  orgName: "",
  representativeName: "",
  representativePhone: "",
  representativeEmail: "",
  adminEmail: "",
  adminPassword: "",
};