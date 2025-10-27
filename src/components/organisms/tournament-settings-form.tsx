"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import type { Tournament } from "@/types/tournament.schema";

import { FormInput } from "@/components/molecules/form-input";
import { AddButton, RemoveButton } from "@/components/molecules/action-buttons";
import { LoadingButton } from "@/components/molecules/loading-button";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useArrayField } from "@/hooks/useArrayField";
import { useToast } from "@/components/providers/notification-provider";

// 大会設定フォーム用のスキーマ
const tournamentSettingsSchema = z.object({
  tournamentName: z.string().min(1, "大会名は必須です"),
  tournamentDate: z.string().min(1, "開催日は必須です"),
  location: z.string().min(1, "開催場所は必須です"),
  defaultMatchTimeMinutes: z.number().min(1, "試合時間は1分以上で設定してください"),
  defaultMatchTimeSeconds: z.number().min(0).max(59, "秒は0-59の範囲で入力してください"),
  courts: z.array(z.object({
    courtId: z.string(),
    courtName: z.string().min(1, "コート名は必須です"),
  })).min(1, "最低1つのコートを設定してください"),
});

type TournamentSettingsData = z.infer<typeof tournamentSettingsSchema>;

interface TournamentSettingsFormProps {
  tournament: Tournament;
  onSave: (data: Omit<Tournament, 'createdAt' | 'updatedAt'>) => Promise<void>;
  className?: string;
}

export function TournamentSettingsForm({
  tournament,
  onSave,
  className,
}: TournamentSettingsFormProps) {
  const { isLoading, handleSubmit: handleFormSubmission } = useFormSubmit<Omit<Tournament, 'createdAt' | 'updatedAt'>>();
  const { showWarning } = useToast();

  // 秒を分と秒に分割
  const defaultMinutes = Math.floor(tournament.defaultMatchTime / 60);
  const defaultSeconds = tournament.defaultMatchTime % 60;

  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm<TournamentSettingsData>({
    resolver: zodResolver(tournamentSettingsSchema),
    defaultValues: {
      tournamentName: tournament.tournamentName,
      tournamentDate: tournament.tournamentDate,
      location: tournament.location,
      defaultMatchTimeMinutes: defaultMinutes,
      defaultMatchTimeSeconds: defaultSeconds,
      courts: tournament.courts.map(court => ({
        courtId: court.courtId,
        courtName: court.courtName,
      })),
    },
  });

  const { fields, addItem, removeItem } = useArrayField(control, "courts", {
    minItems: 1,
    defaultItem: () => ({
      courtId: `court-${Date.now()}`,
      courtName: "",
    }),
    onMinItemsRequired: (minItems) => {
      showWarning('削除できません', `最低${minItems}コートが必要です`);
    }
  });

  // コートを追加（共通hookを使用）
  const addCourt = () => addItem();

  // コートを削除（共通hookを使用）
  const removeCourt = (index: number) => removeItem(index);

  // フォーム送信
  const handleFormSubmit = async (data: TournamentSettingsData) => {
    // 分と秒を秒に変換
    const totalSeconds = data.defaultMatchTimeMinutes * 60 + data.defaultMatchTimeSeconds;

    const tournamentData = {
      tournamentName: data.tournamentName,
      tournamentDate: data.tournamentDate,
      location: data.location,
      defaultMatchTime: totalSeconds,
      courts: data.courts,
    };

    await handleFormSubmission(onSave, tournamentData, {
      onSuccess: () => {
      }
    });
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">大会設定</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="大会名"
                name="tournamentName"
                required
                placeholder="第50回全国日本拳法大会"
                register={register}
                error={errors.tournamentName?.message}
              />

              <FormInput
                label="開催日"
                name="tournamentDate"
                required
                placeholder="2024-03-20"
                register={register}
                error={errors.tournamentDate?.message}
              />
            </div>

            <FormInput
              label="開催場所"
              name="location"
              required
              placeholder="東京体育館"
              register={register}
              error={errors.location?.message}
            />
          </CardContent>
        </Card>

        {/* 試合設定 */}
        <Card>
          <CardHeader>
            <CardTitle>試合設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>デフォルト試合時間 *</Label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Input
                    {...register("defaultMatchTimeMinutes", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="59"
                    className="w-20"
                    placeholder="3"
                  />
                  <span className="text-sm text-gray-600">分</span>
                </div>

                <div className="flex items-center gap-1">
                  <Input
                    {...register("defaultMatchTimeSeconds", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="59"
                    className="w-20"
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-600">秒</span>
                </div>
              </div>
              {errors.defaultMatchTimeMinutes && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.defaultMatchTimeMinutes.message}
                </p>
              )}
              {errors.defaultMatchTimeSeconds && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.defaultMatchTimeSeconds.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* コート設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>会場のコート情報</CardTitle>
              <AddButton onClick={addCourt}>
                コートを追加
              </AddButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      {...register(`courts.${index}.courtName`)}
                      placeholder={`${String.fromCharCode(65 + index)}コート`}
                    />
                    {errors.courts?.[index]?.courtName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.courts[index]?.courtName?.message}
                      </p>
                    )}
                  </div>

                  <RemoveButton
                    onClick={() => removeCourt(index)}
                    disabled={fields.length === 1}
                  />
                </div>
              ))}

              {errors.courts && typeof errors.courts.message === 'string' && (
                <p className="text-sm text-red-600">
                  {errors.courts.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}