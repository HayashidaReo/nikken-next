"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Switch } from "@/components/atoms/switch";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/team.schema";

// 編集用のスキーマ
const teamEditSchema = z.object({
  teamName: z.string().min(1, "チーム名は必須です"),
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "電話番号は必須です"),
  representativeEmail: z.string().email("正しいメールアドレスを入力してください"),
  isApproved: z.boolean(),
  remarks: z.string(),
  players: z.array(z.object({
    playerId: z.string(),
    lastName: z.string().min(1, "姓は必須です"),
    firstName: z.string().min(1, "名は必須です"),
    displayName: z.string(),
  })),
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
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  // フォームの変更を監視
  const watchedValues = watch();
  React.useEffect(() => {
    setHasUnsavedChanges(true);
  }, [watchedValues]);

  // displayNameを自動生成する関数
  const updateDisplayNames = () => {
    const players = watchedValues.players;
    
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
            return `${lastName} ${otherPlayer.firstName.charAt(0)}` === displayName;
          });
          
          if (sameDisplay.length > 1) {
            displayName = `${lastName} ${firstName}`;
          }
          
          setValue(`players.${index}.displayName`, displayName);
        });
      }
    });
  };

  // 選手を追加
  const addPlayer = () => {
    append({
      playerId: `player-${Date.now()}`,
      lastName: "",
      firstName: "",
      displayName: "",
    });
  };

  // 選手を削除
  const removePlayer = (index: number) => {
    remove(index);
    // displayNameを再計算
    setTimeout(updateDisplayNames, 100);
  };

  // 姓・名が変更されたときにdisplayNameを更新
  const handleNameChange = () => {
    setTimeout(updateDisplayNames, 100);
  };

  // フォーム送信
  const handleFormSubmit = async (data: TeamEditData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      setHasUnsavedChanges(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ページを離れる際の確認
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      if (confirm("編集内容が破棄されますがよろしいですか？")) {
        onCancel();
      }
    } else {
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
          <h1 className="text-2xl font-bold text-gray-900">
            チーム情報編集
          </h1>
        </div>
        <Button onClick={handleSubmit(handleFormSubmit)} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "保存中..." : "保存"}
        </Button>
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
                checked={watchedValues.isApproved}
                onCheckedChange={(checked) => setValue("isApproved", checked)}
              />
              <Label className="font-medium">
                {watchedValues.isApproved ? "承認済み" : "未承認"}
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamName">チーム名 *</Label>
                <Input
                  {...register("teamName")}
                  id="teamName"
                  placeholder="チーム名を入力"
                />
                {errors.teamName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.teamName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="representativeName">代表者名 *</Label>
                <Input
                  {...register("representativeName")}
                  id="representativeName"
                  placeholder="代表者名を入力"
                />
                {errors.representativeName && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativeName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="representativePhone">電話番号 *</Label>
                <Input
                  {...register("representativePhone")}
                  id="representativePhone"
                  placeholder="電話番号を入力"
                />
                {errors.representativePhone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativePhone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="representativeEmail">メールアドレス *</Label>
                <Input
                  {...register("representativeEmail")}
                  id="representativeEmail"
                  type="email"
                  placeholder="メールアドレスを入力"
                />
                {errors.representativeEmail && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.representativeEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">備考</Label>
              <textarea
                {...register("remarks")}
                id="remarks"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="備考があれば入力してください"
              />
            </div>
          </CardContent>
        </Card>

        {/* 選手一覧 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>参加選手一覧</CardTitle>
              <Button type="button" onClick={addPlayer} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                選手を追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePlayer(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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