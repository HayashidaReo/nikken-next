"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import {
  ConfirmationDialog,
  PlayerListForm,
  FormInput,
  FormTextarea,
  LoadingButton,
  type PlayerRegistrationData
} from "@/components/molecules";
import { useFormSubmit, useNotifications } from "@/hooks";

// 選手登録フォーム用のスキーマ
const playerRegistrationSchema = z.object({
  representativeName: z.string().min(1, "代表者名は必須です"),
  representativePhone: z.string().min(1, "代表者電話番号は必須です"),
  representativeEmail: z
    .string()
    .min(1, "代表者メールアドレスは必須です")
    .email("正しいメールアドレスを入力してください"),
  teamName: z.string().min(1, "チーム名（所属名）は必須です"),
  players: z
    .array(z.object({
      fullName: z.string().min(1, "選手名は必須です"),
    }))
    .min(1, "最低1人の選手を登録してください"),
  remarks: z.string(),
});

interface PlayerRegistrationFormProps {
  onSubmit: (data: PlayerRegistrationData) => Promise<void>;
  className?: string;
}

export function PlayerRegistrationForm({ onSubmit, className }: PlayerRegistrationFormProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const { showError } = useNotifications();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PlayerRegistrationData>({
    resolver: zodResolver(playerRegistrationSchema),
    defaultValues: {
      representativeName: "",
      representativePhone: "",
      representativeEmail: "",
      teamName: "",
      players: [{ fullName: "" }],
      remarks: "",
    },
  });

  const { handleSubmit: submitForm, isLoading } = useFormSubmit();

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    const formData = getValues();
    await submitForm(
      async (data: unknown) => {
        const typedData = data as PlayerRegistrationData;
        await onSubmit(typedData);
        router.push('/player-registration/complete');
      },
      formData,
      {
        onError: (error: Error) => {
          showError('登録に失敗しました', error.message);
        }
      }
    );
    setShowConfirmation(false);
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">選手登録フォーム</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* 代表者情報 */}
            <Card>
              <CardHeader>
                <CardTitle>代表者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="代表者名"
                    name="representativeName"
                    required
                    placeholder="山田太郎"
                    register={register}
                    error={errors.representativeName?.message}
                  />

                  <FormInput
                    label="代表者電話番号"
                    name="representativePhone"
                    type="tel"
                    required
                    placeholder="090-1234-5678"
                    register={register}
                    error={errors.representativePhone?.message}
                  />

                  <FormInput
                    label="代表者メールアドレス"
                    name="representativeEmail"
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="md:col-span-2"
                    register={register}
                    error={errors.representativeEmail?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* チーム情報 */}
            <Card>
              <CardHeader>
                <CardTitle>チーム情報</CardTitle>
              </CardHeader>
              <CardContent>
                <FormInput
                  label="チーム名（所属名）"
                  name="teamName"
                  required
                  placeholder="○○道場 / ○○大学"
                  register={register}
                  error={errors.teamName?.message}
                />
              </CardContent>
            </Card>

            {/* 選手一覧 */}
            <PlayerListForm
              control={control}
              errors={errors}
              register={register}
            />

            {/* 備考 */}
            <Card>
              <CardHeader>
                <CardTitle>備考</CardTitle>
              </CardHeader>
              <CardContent>
                <FormTextarea
                  label="備考"
                  name="remarks"
                  placeholder="特別な配慮事項や連絡事項があれば記入してください"
                  rows={4}
                  register={register}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                戻る
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isLoading}
              >
                確認画面へ
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isVisible={showConfirmation}
        data={getValues()}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}