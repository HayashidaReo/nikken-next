"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils/utils";
import type { Team } from "@/types/team.schema";

import { FormInput, FormTextarea } from "@/components/molecules/form-input";
import { AddButton, RemoveButton } from "@/components/molecules/action-buttons";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { AnimatePresence } from "framer-motion";
import { AnimatedListItem } from "@/components/atoms/animated-list-item";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/atoms/tooltip";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useToast } from "@/components/providers/notification-provider";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useArrayField } from "@/hooks/useArrayField";
import { useTeamFormKeyboard } from "@/hooks/useTeamFormKeyboard";
import { useTeamFormDeletion } from "@/hooks/useTeamFormDeletion";
import { useConfirmSave } from "@/hooks/useConfirmSave";
import { createDefaultTeamEditValues } from "@/lib/form-defaults";

import { teamManagementSchema } from "@/types/team.schema";
import { DisplayNameService } from "@/domains/team/services/display-name.service";


// 編集用のスキーマ
// 管理画面では代表者情報は任意（ただし入力時は形式チェックあり）
const teamEditSchema = teamManagementSchema;

type TeamEditData = z.infer<typeof teamEditSchema>;

interface TeamFormProps {
  team?: Team;
  onSave: (data: TeamEditData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function TeamForm({
  team,
  onSave,
  onCancel,
  className,
}: TeamFormProps) {
  const isEditMode = !!team;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { isLoading, handleSubmit: handleFormSubmission } =
    useFormSubmit<TeamEditData>();
  const { confirmNavigation } = useUnsavedChanges(hasUnsavedChanges);
  const { showWarning } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<TeamEditData>({
    resolver: zodResolver(teamEditSchema),
    defaultValues: team
      ? createDefaultTeamEditValues(team)
      : {
        teamName: "",
        representativeName: "",
        representativePhone: "",
        representativeEmail: "",
        isApproved: false,
        remarks: "",
        players: [
          {
            playerId: `player-${Date.now()}`,
            lastName: "",
            firstName: "",
            displayName: "",
          },
        ],
      },
  });

  const { fields, addItem, removeItem } = useArrayField(control, "players", {
    minItems: 1,
    defaultItem: () => ({
      playerId: `player-${Date.now()}`,
      lastName: "",
      firstName: "",
      displayName: "",
    }),
    onMinItemsRequired: minItems => {
      showWarning(`削除できません。最低${minItems}人の選手が必要です。`);
    },
  });

  // フォームの変更を監視（isDirtyフラグを使用）
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // 削除管理フック
  const { deletedPlayerCount, trackDeletion, resetDeletionCount } = useTeamFormDeletion(
    team?.players.map(p => p.playerId) || []
  );

  // displayNameを自動生成する関数
  const updateDisplayNames = useCallback(() => {
    const currentValues = getValues();
    const players = currentValues.players || [];

    // DisplayNameServiceを使用して表示名を生成
    // フォームのplayersデータはPlayer型と互換性があるためキャストして使用
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedPlayers = DisplayNameService.generateDisplayNames(players as any[]);

    updatedPlayers.forEach((player, index) => {
      // 現在の値と比較して変更があれば更新
      // players[index]が存在することを確認
      if (players[index] && players[index].displayName !== player.displayName) {
        setValue(`players.${index}.displayName`, player.displayName);
      }
    });
  }, [getValues, setValue]);

  // 選手を追加（共通hookを使用）
  const addPlayer = () => addItem();

  // React Hook Form の useWatch を使って players の変更を監視し、displayName を同期的に更新します
  const watchedPlayers = useWatch({ control, name: "players" });

  useEffect(() => {
    updateDisplayNames();
    // 「フォーム上の選手データが変更されたときにのみ表示名を再計算する」ことであり、
    // updateDisplayNames の参照が変わるたびに effect を再実行させたくないため
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateDisplayNames intentionally omitted on purpose
  }, [watchedPlayers]);

  // 選手を削除（即座に削除、確認なし）
  const handleRemovePlayer = (index: number) => {
    const players = getValues().players || [];
    const player = players[index];

    removeItem(index);

    // 削除を追跡
    if (player) {
      trackDeletion(player.playerId);
    }
  };

  // 保存確認フック
  const { showConfirmDialog, attemptSave, confirmSave, cancelSave } = useConfirmSave<TeamEditData>({
    shouldConfirm: () => deletedPlayerCount > 0,
    onSave: async (data) => {
      await handleFormSubmission(onSave, data, {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          resetDeletionCount();
        },
      });
    },
    onSuccess: () => {
      // 追加の成功時処理があればここに記述
    },
  });

  // フォーム送信
  const handleFormSubmit = async (data: TeamEditData) => {
    await attemptSave(data);
  };

  const handleCancelClick = () => {
    if (confirmNavigation("編集内容が破棄されますがよろしいですか？")) {
      onCancel();
    }
  };

  // キーボードナビゲーションのハンドリング
  const { handleKeyDown } = useTeamFormKeyboard({
    fieldsLength: fields.length,
    addPlayer,
  });

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancelClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "チーム情報編集" : "チーム新規登録"}
          </h1>
        </div>
        <Button onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading} loadingText="保存中...">
          {isEditMode ? "保存" : "登録"}
        </Button>
      </div>

      <TooltipProvider delayDuration={20}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          onKeyDown={handleKeyDown}
          className="space-y-6"
        >
          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="チーム名"
                  name="teamName"
                  required
                  placeholder="チーム名を入力"
                  register={register}
                  error={errors.teamName?.message}
                />

                <FormInput
                  label="代表者名"
                  name="representativeName"
                  placeholder="代表者名を入力"
                  register={register}
                  error={errors.representativeName?.message}
                />

                <FormInput
                  label="電話番号"
                  name="representativePhone"
                  type="tel"
                  placeholder="電話番号を入力"
                  register={register}
                  error={errors.representativePhone?.message}
                />

                <FormInput
                  label="メールアドレス"
                  name="representativeEmail"
                  type="email"
                  placeholder="メールアドレスを入力"
                  register={register}
                  error={errors.representativeEmail?.message}
                />
              </div>

              <FormTextarea
                label="備考"
                name="remarks"
                placeholder="備考があれば入力してください"
                rows={3}
                register={register}
              />
            </CardContent>
          </Card>

          {/* 選手一覧 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>参加選手一覧</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                    <AnimatedListItem
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-[repeat(3,1fr)_80px] gap-4 p-3 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <Label className="text-sm">姓 *</Label>
                        <Input
                          {...register(`players.${index}.lastName`)}
                          placeholder="山田"
                        />
                        {errors.players?.[index]?.lastName && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.players[index]?.lastName?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm">名 *</Label>
                        <Input
                          {...register(`players.${index}.firstName`)}
                          placeholder="太郎"
                        />
                        {errors.players?.[index]?.firstName && (
                          <p className="text-sm text-red-600 mt-1">
                            {errors.players[index]?.firstName?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-sm">表示名</Label>

                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="min-h-[38px] flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm text-gray-700 w-full"
                                aria-label="表示名は自動的に生成されます"
                                aria-readonly="true"
                              >
                                {watchedPlayers?.[index]?.displayName ?? ""}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" sideOffset={6}>
                              表示名は自動的に生成されます
                            </TooltipContent>
                          </Tooltip>

                          {/* Hidden input to keep displayName in form state */}
                          <input type="hidden" {...register(`players.${index}.displayName`)} />
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <RemoveButton onClick={() => handleRemovePlayer(index)} />
                      </div>
                    </AnimatedListItem>
                  ))}
                </AnimatePresence>

                {/* リストの最後尾に選手追加ボタンを配置（大会組み合わせ画面と同様のフル幅表示） */}
                <div className="mt-2">
                  <AddButton onClick={addPlayer} className="w-full">
                    選手を追加
                  </AddButton>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    選手が登録されていません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </TooltipProvider>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="選手の削除確認"
        message={`${deletedPlayerCount}人の選手を削除しました。このまま保存しますか？`}
        onConfirm={confirmSave}
        onCancel={cancelSave}
        confirmText="保存する"
        cancelText="キャンセル"
        variant="default"
      />
    </div>
  );
}
