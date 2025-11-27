import { useState } from "react";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { Button } from "@/components/atoms/button";
import { TimePicker } from "@/components/molecules/time-picker";
import { CourtManager } from "@/components/molecules/court-manager";
import { RoundManager } from "@/components/molecules/round-manager";
import { FormField } from "@/components/molecules/form-field";
import { FormHeader } from "@/components/molecules/form-header";
import { SearchableSelect } from "@/components/molecules/searchable-select";
import { useToast } from "@/components/providers/notification-provider";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import {
  formatDateToInputValue,
  parseInputValueToDate,
} from "@/lib/utils/date-utils";
import type { TournamentFormData } from "@/types/tournament.schema";
import { TEXT_LENGTH_LIMITS } from "@/lib/constants";

interface TournamentFormProps {
  formData: TournamentFormData;
  initialCourts?: { courtId: string; courtName: string }[];
  initialRounds?: { roundId: string; roundName: string }[];
  isAddingNew: boolean;
  onFormChange: (
    field: keyof TournamentFormData,
    value:
      | string
      | number
      | Date
      | null
      | { courtId: string; courtName: string }[]
      | { roundId: string; roundName: string }[]
  ) => void;
  onSave: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * 大会設定フォームコンポーネント
 * 大会情報の編集・作成フォーム機能を提供
 */
export function TournamentSettingForm({
  formData,
  initialCourts = [],
  initialRounds = [],
  isAddingNew,
  onFormChange,
  onSave,
  onCancel,
  className = "",
}: TournamentFormProps) {
  const { showWarning } = useToast();

  const handleInputChange = (
    field: keyof TournamentFormData,
    value: string,
    maxLength?: number
  ) => {
    if (maxLength && value.length > maxLength) {
      showWarning(`${maxLength}文字以内で入力してください`);
      return;
    }
    onFormChange(field, value);
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSaveClick = () => {
    // 新規作成時はチェック不要
    if (isAddingNew) {
      onSave();
      return;
    }

    // 削除された既存項目の数を計算
    const initialCourtIds = new Set(initialCourts.map(c => c.courtId));
    const currentCourtIds = new Set(formData.courts.map(c => c.courtId));
    const deletedCourtCount = Array.from(initialCourtIds).filter(id => !currentCourtIds.has(id)).length;

    const initialRoundIds = new Set(initialRounds.map(r => r.roundId));
    const currentRoundIds = new Set(formData.rounds.map(r => r.roundId));
    const deletedRoundCount = Array.from(initialRoundIds).filter(id => !currentRoundIds.has(id)).length;

    if (deletedCourtCount > 0 || deletedRoundCount > 0) {
      setShowSaveConfirm(true);
      return;
    }

    onSave();
  };

  const confirmSave = () => {
    setShowSaveConfirm(false);
    onSave();
  };

  const cancelSave = () => {
    setShowSaveConfirm(false);
  };
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <FormHeader
        title={isAddingNew ? "新規大会作成" : "大会編集"}
        onCancel={onCancel}
        actions={
          <Button onClick={handleSaveClick} size="sm">
            {isAddingNew ? "大会を作成" : "変更を保存"}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* 大会名 */}
        <FormField label="大会名" required>
          <Input
            id="tournamentName"
            value={formData.tournamentName}
            onChange={e => handleInputChange("tournamentName", e.target.value, TEXT_LENGTH_LIMITS.TOURNAMENT_NAME_MAX)}
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

        {/* 大会形式 */}
        <FormField label="大会形式" required>
          <SearchableSelect
            value={formData.tournamentType || ""}
            onValueChange={(value) => onFormChange("tournamentType", value)}
            options={[
              { value: "individual", label: "個人戦" },
              { value: "team", label: "団体戦" },
            ]}
            placeholder="大会形式を選択"
            className="h-10"
          />
        </FormField>

        {/* 大会概要 */}
        <FormField label="大会概要">
          <Textarea
            id="tournamentDetail"
            value={formData.tournamentDetail || ""}
            onChange={e => handleInputChange("tournamentDetail", e.target.value, TEXT_LENGTH_LIMITS.TOURNAMENT_DETAIL_MAX)}
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
            onChange={e => handleInputChange("location", e.target.value, TEXT_LENGTH_LIMITS.LOCATION_MAX)}
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
        <FormField label="コート選択リスト">
          <CourtManager
            courts={formData.courts}
            onChange={courts => onFormChange("courts", courts)}
          />
        </FormField>

        {/* ラウンド管理 */}
        <FormField label="ラウンド設定">
          <RoundManager
            rounds={formData.rounds}
            onChange={rounds => onFormChange("rounds", rounds)}
          />
        </FormField>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="設定項目の削除確認"
        message={`このままラウンドまたはコートの項目を削除すると、現在その値が設定されている項目は「未選択」になります。<br/>該当の試合については、後ほど設定のし直しをお願いいたします。<br/>保存を実行しますか？`}
        onConfirm={confirmSave}
        onCancel={cancelSave}
        confirmText="保存する"
        cancelText="キャンセル"
      />
    </div>
  );
}
