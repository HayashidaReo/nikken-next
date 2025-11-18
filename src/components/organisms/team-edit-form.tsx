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
import { createDefaultTeamEditValues } from "@/lib/form-defaults";
import { formatPlayerFullName } from "@/lib/utils/player-name-utils";

// 編集用のスキーマ
const teamEditSchema = z.object({
  teamName: z.string().min(1, "チーム名は必須です"),
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "電話番号は必須です"),
  representativeEmail: z.email("正しいメールアドレスを入力してください"),
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

type TeamEditData = z.infer<typeof teamEditSchema>;

interface TeamEditFormProps {
  team: Team;
  onSave: (data: TeamEditData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function TeamEditForm({
  team,
  onSave,
  onCancel,
  className,
}: TeamEditFormProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { isLoading, handleSubmit: handleFormSubmission } =
    useFormSubmit<TeamEditData>();
  const { confirmNavigation } = useUnsavedChanges(hasUnsavedChanges);
  const { showWarning, showSuccess } = useToast();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<TeamEditData>({
    resolver: zodResolver(teamEditSchema),
    defaultValues: createDefaultTeamEditValues(team),
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


  // displayNameを自動生成する関数
  const updateDisplayNames = useCallback(() => {
    const currentValues = getValues();
    const players = currentValues.players || [];

    // 姓でグループ化
    const lastNameGroups: { [key: string]: number[] } = {};
    players.forEach((player, index) => {
      const lastName = player.lastName;
      if (!lastNameGroups[lastName]) {
        lastNameGroups[lastName] = [];
      }
      lastNameGroups[lastName].push(index);
    });

    // displayNameを更新
    Object.entries(lastNameGroups).forEach(([lastName, indices]) => {
      if (indices.length === 1) {
        // 重複なし：姓のみ
        const idx = indices[0];
        const current = players[idx]?.displayName || "";
        if (current !== lastName) {
          setValue(`players.${idx}.displayName`, lastName);
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
            setValue(`players.${index}.displayName`, displayName);
          }
        });
      }
    });
  }, [getValues, setValue]);

  // 選手を追加（共通hookを使用）
  const addPlayer = () => addItem();

  // React Hook Form の useWatch を使って players の変更を監視し、displayName を同期的に更新します
  const watchedPlayers = useWatch({ control, name: "players" });

  useEffect(() => {
    updateDisplayNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateDisplayNames intentionally omitted; see note above
  }, [watchedPlayers]);

  // 選手を削除（共通hookを使用）

  // 削除確認ダイアログの state
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const requestRemovePlayer = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmRemovePlayer = () => {
    if (deleteConfirmIndex !== null) {
      const players = getValues().players || [];
      const name = formatPlayerFullName(players, deleteConfirmIndex);

      removeItem(deleteConfirmIndex);
      setDeleteConfirmIndex(null);
      showSuccess(`${name} を削除しました`);
    }
  };

  const cancelRemovePlayer = () => setDeleteConfirmIndex(null);

  // displayName の更新は useWatch + useEffect で行うため、個別のハンドラは不要

  // フォーム送信
  const handleFormSubmit = async (data: TeamEditData) => {
    await handleFormSubmission(onSave, data, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
      },
    });
  };

  const handleCancelClick = () => {
    if (confirmNavigation("編集内容が破棄されますがよろしいですか？")) {
      onCancel();
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancelClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">チーム情報編集</h1>
        </div>
        <Button onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading} loadingText="保存中...">
          保存
        </Button>
      </div>

      <TooltipProvider delayDuration={20}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  required
                  placeholder="代表者名を入力"
                  register={register}
                  error={errors.representativeName?.message}
                />

                <FormInput
                  label="電話番号"
                  name="representativePhone"
                  required
                  type="tel"
                  placeholder="電話番号を入力"
                  register={register}
                  error={errors.representativePhone?.message}
                />

                <FormInput
                  label="メールアドレス"
                  name="representativeEmail"
                  required
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
                                {(() => {
                                  const players = getValues().players || [];
                                  const p = players[index];
                                  return p?.displayName || "自動生成";
                                })()}
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
                        <RemoveButton onClick={() => requestRemovePlayer(index)} />
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
        isOpen={deleteConfirmIndex !== null}
        title="選手の削除確認"
        message={
          deleteConfirmIndex !== null
            ? (() => {
              const players = getValues().players || [];
              const name = formatPlayerFullName(players, deleteConfirmIndex as number);
              return `${name} を削除しますか？ この操作は取り消せません。`;
            })()
            : "選手を削除しますか？"
        }
        onConfirm={confirmRemovePlayer}
        onCancel={cancelRemovePlayer}
        confirmText="削除する"
        cancelText="キャンセル"
        variant="destructive"
      />
    </div>
  );
}
