import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { TimePicker } from "@/components/molecules/time-picker";
import { CourtManager } from "@/components/molecules/court-manager";
import { FormField } from "@/components/molecules/form-field";
import { FormHeader } from "@/components/molecules/form-header";
import { FormActions } from "@/components/molecules/form-actions";
import {
  formatDateToInputValue,
  parseInputValueToDate,
} from "@/lib/utils/date-utils";
import type { TournamentFormData } from "@/types/tournament.schema";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";

interface TournamentFormProps {
  formData: TournamentFormData;
  isAddingNew: boolean;
  onFormChange: (
    field: keyof TournamentFormData,
    value:
      | string
      | number
      | Date
      | null
      | { courtId: string; courtName: string }[]
  ) => void;
  onSave: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 大会設定フォームコンポーネント
 * 大会情報の編集・作成フォーム機能を提供
 */
export function TournamentForm({
  formData,
  isAddingNew,
  onFormChange,
  onSave,
  onCancel,
  className = "",
}: TournamentFormProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <FormHeader
        title={isAddingNew ? "新規大会作成" : "大会編集"}
        onCancel={onCancel}
      />

      <div className="space-y-6">
        {/* 大会名 */}
        <FormField label="大会名" required>
          <Input
            id="tournamentName"
            value={formData.tournamentName}
            onChange={e => onFormChange("tournamentName", e.target.value)}
            placeholder="大会名を入力してください"
            maxLength={TEXT_LENGTH_LIMITS.TOURNAMENT_NAME_MAX}
          />
        </FormField>

        {/* 開催日 */}
        <FormField label="開催日" required>
          <Input
            id="tournamentDate"
            type="date"
            value={formatDateToInputValue(formData.tournamentDate)}
            onChange={e =>
              onFormChange(
                "tournamentDate",
                parseInputValueToDate(e.target.value)
              )
            }
            required
          />
        </FormField>

        {/* 大会概要 */}
        <FormField label="大会概要">
          <Textarea
            id="tournamentDetail"
            value={formData.tournamentDetail || ""}
            onChange={e => onFormChange("tournamentDetail", e.target.value)}
            placeholder="大会の詳細情報や説明を入力してください"
            rows={4}
            maxLength={TEXT_LENGTH_LIMITS.TOURNAMENT_DETAIL_MAX}
          />
        </FormField>

        {/* 開催場所 */}
        <FormField label="開催場所" required>
          <Input
            id="location"
            value={formData.location}
            onChange={e => onFormChange("location", e.target.value)}
            placeholder="開催場所を入力してください"
            maxLength={TEXT_LENGTH_LIMITS.LOCATION_MAX}
          />
        </FormField>

        {/* デフォルト試合時間 */}
        <FormField label="デフォルト試合時間">
          <TimePicker
            value={formData.defaultMatchTime}
            onChange={seconds => onFormChange("defaultMatchTime", seconds)}
          />
        </FormField>

        {/* コート管理 */}
        <FormField label="コート設定">
          <CourtManager
            courts={formData.courts}
            onChange={courts => onFormChange("courts", courts)}
          />
        </FormField>

        {/* 保存ボタン */}
        <FormActions
          onSave={onSave}
          saveButtonText={isAddingNew ? "大会を作成" : "変更を保存"}
        />
      </div>
    </div>
  );
}
