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

import { teamManagementSchema } from "@/types/team.schema";
import { generateDisplayNames } from "@/domains/team/services/display-name-service";

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

  // フォーム開始時の選手IDリストを保持（既存の選手を判定するため）
  const [initialPlayerIds] = useState<Set<string>>(() => {
    const players = team?.players || [];
    return new Set(players.map((p) => p.playerId));
  });


  // displayNameを自動生成する関数
  const updateDisplayNames = useCallback(() => {
    const currentValues = getValues();
    const players = currentValues.players || [];

    const updates = generateDisplayNames(players);

    updates.forEach(({ index, displayName }) => {
      setValue(`players.${index}.displayName`, displayName);
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

  // 削除された既存選手の数を記録
  const [deletedPlayerCount, setDeletedPlayerCount] = useState(0);

  // 選手を削除（即座に削除、確認なし）
  const handleRemovePlayer = (index: number) => {
    const players = getValues().players || [];
    const player = players[index];

    removeItem(index);

    // フォーム開始時に存在していた選手（既存の選手）のみカウント
    if (player && initialPlayerIds.has(player.playerId)) {
      setDeletedPlayerCount((prev) => prev + 1);
    }
  };

  // 保存確認ダイアログの state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<TeamEditData | null>(null);

  // フォーム送信
  const handleFormSubmit = async (data: TeamEditData) => {
    // 既存選手が削除された場合は確認ダイアログを表示
    if (deletedPlayerCount > 0) {
      setPendingSaveData(data);
      setShowSaveConfirm(true);
      return;
    }

    // 削除がない場合は直接保存
    await handleFormSubmission(onSave, data, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
      },
    });
  };

  // 保存確認後の実行
  const confirmSave = async () => {
    if (!pendingSaveData) return;

    setShowSaveConfirm(false);
    await handleFormSubmission(onSave, pendingSaveData, {
      onSuccess: () => {
        setHasUnsavedChanges(false);
        setDeletedPlayerCount(0);
        setPendingSaveData(null);
      },
    });
  };

  const cancelSave = () => {
    setShowSaveConfirm(false);
    setPendingSaveData(null);
  };

  const handleCancelClick = () => {
    if (confirmNavigation("編集内容が破棄されますがよろしいですか？")) {
      onCancel();
    }
  };

  // キーボードナビゲーションのハンドリング
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter") return;

    // IME変換中の場合は処理をスキップ（日本語入力など）
    if (e.nativeEvent.isComposing) return;

    // textareaの場合は処理をスキップ（複数行入力のため）
    if (e.target instanceof HTMLTextAreaElement) return;

    // フォーム送信（Ctrl+Enterなど）やボタンへのフォーカス時は除外
    if (e.ctrlKey || e.metaKey || e.target instanceof HTMLButtonElement) return;

    e.preventDefault();

    const target = e.target as HTMLElement;
    const form = e.currentTarget;
    const focusableElements = Array.from(
      form.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]), select, textarea, button:not([type="submit"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null); // 表示されている要素のみ

    const currentIndex = focusableElements.indexOf(target);

    // 選手追加のロジック: 最後の選手の「名」フィールドでEnterを押した場合
    const isLastPlayerFirstName = (() => {
      if (target.getAttribute("name")?.match(/players\.(\d+)\.firstName/)) {
        const match = target.getAttribute("name")?.match(/players\.(\d+)\.firstName/);
        const index = match ? parseInt(match[1], 10) : -1;
        return index === fields.length - 1;
      }
      return false;
    })();

    if (isLastPlayerFirstName) {
      addPlayer();
      // レンダリング後に新しいフィールドにフォーカス
      setTimeout(() => {
        const newIndex = fields.length; // 追加後のインデックス
        const lastNameInput = form.querySelector<HTMLInputElement>(
          `input[name="players.${newIndex}.lastName"]`
        );
        lastNameInput?.focus();
      }, 0);
      return;
    }

    // 通常のナビゲーション: 次の要素へフォーカス移動
    if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
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
        isOpen={showSaveConfirm}
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
