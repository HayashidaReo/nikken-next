"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils/utils";
import type { Tournament } from "@/types/tournament.schema";
import { FORM_CONSTANTS, TIME_CONSTANTS } from "@/lib/constants";

import { FormInput } from "@/components/molecules/form-input";
import { AddButton, RemoveButton } from "@/components/molecules/action-buttons";
import { Button } from "@/components/atoms/button";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useArrayField } from "@/hooks/useArrayField";
import { useToast } from "@/components/providers/notification-provider";
import { createDefaultTournamentSettingsValues } from "@/lib/form-defaults";

// 大会設定フォーム用のスキーマ
const tournamentSettingsSchema = z.object({
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
        courtId: z.string().optional(),
        courtName: z.string().min(1, "コート名は必須です"),
      })
    )
    .min(1, "最低1つのコートを設定してください"),
  rounds: z
    .array(
      z.object({
        roundId: z.string().optional(),
        roundName: z.string().min(1, "ラウンド名は必須です"),
      })
    )
    .min(1, "最低1つのラウンドを設定してください"),
});

type TournamentSettingsData = z.infer<typeof tournamentSettingsSchema>;

interface TournamentSettingsFormProps {
  tournament: Tournament | null;
  onSave: (data: {
    tournamentName: string;
    tournamentDate: Date; // string から Date に変更
    location: string;
    defaultMatchTime: number;
    courts: { courtId?: string; courtName: string }[];
    rounds: { roundId?: string; roundName: string }[];
  }) => Promise<void>;
  isNewTournament?: boolean;
  className?: string;
}

export function TournamentSettingsForm({
  tournament,
  onSave,
  isNewTournament = false,
  className,
}: TournamentSettingsFormProps) {
  const { isLoading, handleSubmit: handleFormSubmission } = useFormSubmit<{
    tournamentName: string;
    tournamentDate: Date; // string から Date に変更
    location: string;
    defaultMatchTime: number;
    courts: { courtId?: string; courtName: string }[];
    rounds: { roundId?: string; roundName: string }[];
  }>();
  const { showWarning } = useToast();

  // 秒を分と秒に分割（新規作成時はデフォルト値）
  const defaultMinutes = tournament
    ? Math.floor(
      tournament.defaultMatchTime / TIME_CONSTANTS.SECONDS_PER_MINUTE
    )
    : 3; // デフォルト3分
  const defaultSeconds = tournament
    ? tournament.defaultMatchTime % TIME_CONSTANTS.SECONDS_PER_MINUTE
    : 0;

  const {
    register,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm<TournamentSettingsData>({
    resolver: zodResolver(tournamentSettingsSchema),
    defaultValues: createDefaultTournamentSettingsValues(
      tournament,
      defaultMinutes,
      defaultSeconds
    ),
  });

  const { fields: courtFields, addItem: addCourtItem, removeItem: removeCourtItem } = useArrayField(control, "courts", {
    minItems: 1,
    defaultItem: () => ({
      courtId: `court-${Date.now()}`,
      courtName: "",
    }),
    onMinItemsRequired: minItems => {
      showWarning(`削除できません。最低${minItems}コートが必要です。`);
    },
  });

  const { fields: roundFields, addItem: addRoundItem, removeItem: removeRoundItem } = useArrayField(control, "rounds", {
    minItems: 1,
    defaultItem: () => ({
      roundId: `round-${Date.now()}`,
      roundName: "",
    }),
    onMinItemsRequired: minItems => {
      showWarning(`削除できません。最低${minItems}ラウンドが必要です。`);
    },
  });

  // コートを追加（共通hookを使用）
  const addCourt = () => addCourtItem();

  // コートを削除（共通hookを使用）
  const removeCourt = (index: number) => removeCourtItem(index);

  // ラウンドを追加
  const addRound = () => addRoundItem();

  // ラウンドを削除
  const removeRound = (index: number) => removeRoundItem(index);

  // フォーム送信
  const handleFormSubmit = async (data: TournamentSettingsData) => {
    // 分と秒を秒に変換
    const totalSeconds =
      data.defaultMatchTimeMinutes * 60 + data.defaultMatchTimeSeconds;

    // tournamentDateを文字列からDateに変換
    const tournamentDate = new Date(data.tournamentDate);

    const tournamentData = {
      tournamentName: data.tournamentName,
      tournamentDate, // Date型に変換済み
      location: data.location,
      defaultMatchTime: totalSeconds,
      courts: data.courts,
      rounds: data.rounds,
    };

    await handleFormSubmission(onSave, tournamentData, {
      onSuccess: () => { },
    });
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewTournament ? "新しい大会を作成" : "大会設定"}
        </h1>
        <Button onClick={handleSubmit(handleFormSubmit)} isLoading={isLoading}>
          {isNewTournament ? "作成" : "保存"}
        </Button>
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
                    {...register("defaultMatchTimeMinutes", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={FORM_CONSTANTS.TIME_INPUT_MIN}
                    max={FORM_CONSTANTS.TIME_INPUT_MAX}
                    className="w-20"
                    placeholder="3"
                  />
                  <span className="text-sm text-gray-600">分</span>
                </div>

                <div className="flex items-center gap-1">
                  <Input
                    {...register("defaultMatchTimeSeconds", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min={FORM_CONSTANTS.TIME_INPUT_MIN}
                    max={FORM_CONSTANTS.TIME_INPUT_MAX}
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
              <AddButton onClick={addCourt}>コートを追加</AddButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courtFields.map((field, index) => (
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
                    disabled={courtFields.length === 1}
                  />
                </div>
              ))}

              {errors.courts && typeof errors.courts.message === "string" && (
                <p className="text-sm text-red-600">{errors.courts.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ラウンド設定 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ラウンド設定</CardTitle>
              <AddButton onClick={addRound}>ラウンドを追加</AddButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roundFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      {...register(`rounds.${index}.roundName`)}
                      placeholder={`ラウンド${index + 1}`}
                    />
                    {errors.rounds?.[index]?.roundName && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.rounds[index]?.roundName?.message}
                      </p>
                    )}
                  </div>

                  <RemoveButton
                    onClick={() => removeRound(index)}
                    disabled={roundFields.length === 1}
                  />
                </div>
              ))}

              {errors.rounds && typeof errors.rounds.message === "string" && (
                <p className="text-sm text-red-600">{errors.rounds.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
