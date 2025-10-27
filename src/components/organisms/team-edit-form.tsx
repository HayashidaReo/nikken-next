"use client";

import * as React from "react";
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
import { Switch } from "@/components/atoms/switch";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/team.schema";

import { FormInput, FormTextarea } from "@/components/molecules/form-input";
import { AddButton, RemoveButton } from "@/components/molecules/action-buttons";
import { LoadingButton } from "@/components/molecules/loading-button";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useToast } from "@/components/providers/notification-provider";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useArrayField } from "@/hooks/useArrayField";

// 編集用のスキーマ
const teamEditSchema = z.object({
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
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
    defaultValues: {
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
    onRemove: () => {
      // displayNameを再計算
      setTimeout(updateDisplayNames, 100);
    },
  });

  // フォームの変更を監視（isDirtyフラグを使用）
  React.useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // 承認状態を個別に監視
  const isApprovedValue = useWatch({
    control,
    name: "isApproved",
    defaultValue: team.isApproved,
  });

  // displayNameを自動生成する関数
  const updateDisplayNames = () => {
    const currentValues = getValues();
    const players = currentValues.players;

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
        setValue(`players.${indices[0]}.displayName`, lastName);
      } else {
        // 重複あり：姓 + 名の一部
        indices.forEach(index => {
          const player = players[index];
          const firstName = player.firstName;
          let displayName = `${lastName} ${firstName.charAt(0)}`;

          // 同じ姓＋名の一部でも重複する場合はフルネーム
          const sameDisplay = indices.filter(i => {
            const otherPlayer = players[i];
            return (
              `${lastName} ${otherPlayer.firstName.charAt(0)}` === displayName
            );
          });

          if (sameDisplay.length > 1) {
            displayName = `${lastName} ${firstName}`;
          }

          setValue(`players.${index}.displayName`, displayName);
        });
      }
    });
  };

  // 選手を追加（共通hookを使用）
  const addPlayer = () => addItem();

  // 選手を削除（共通hookを使用）
  const removePlayer = (index: number) => removeItem(index);

  // 姓・名が変更されたときにdisplayNameを更新
  const handleNameChange = () => {
    setTimeout(updateDisplayNames, 100);
  };

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
        <LoadingButton
          onClick={handleSubmit(handleFormSubmit)}
          isLoading={isLoading}
        >
          保存
        </LoadingButton>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 承認状態 */}
            <div className="flex items-center space-x-3">
              <Switch
                {...register("isApproved")}
                checked={isApprovedValue}
                onCheckedChange={checked => setValue("isApproved", checked)}
              />
              <Label className="font-medium">
                {isApprovedValue ? "承認済み" : "未承認"}
              </Label>
            </div>

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
              <AddButton onClick={addPlayer}>選手を追加</AddButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg"
                >
                  <div>
                    <Label>姓 *</Label>
                    <Input
                      {...register(`players.${index}.lastName`)}
                      placeholder="山田"
                      onChange={handleNameChange}
                    />
                    {errors.players?.[index]?.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.players[index]?.lastName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>名 *</Label>
                    <Input
                      {...register(`players.${index}.firstName`)}
                      placeholder="太郎"
                      onChange={handleNameChange}
                    />
                    {errors.players?.[index]?.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.players[index]?.firstName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>表示名</Label>
                    <Input
                      {...register(`players.${index}.displayName`)}
                      placeholder="自動生成"
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  <div className="flex items-end">
                    <RemoveButton onClick={() => removePlayer(index)} />
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  選手が登録されていません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
