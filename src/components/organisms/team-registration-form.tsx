"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { cn } from "@/lib/utils/utils";
import {
  ConfirmationDialog,
  PlayerListForm,
  FormInput,
  FormTextarea,
  LoadingButton,
} from "@/components/molecules";
import type { TeamFormData } from "@/types/team-form.schema";
import { teamFormSchema } from "@/types/team-form.schema";
import { useFormSubmit } from "@/hooks";
import { useToast } from "@/components/providers/notification-provider";

interface TeamRegistrationFormProps {
  onSubmit: (data: TeamFormData) => Promise<void>;
  className?: string;
  orgId?: string;
  tournamentId?: string;
}

export function TeamRegistrationForm({
  onSubmit,
  className,
  orgId,
  tournamentId,
}: TeamRegistrationFormProps) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { showError, showSuccess } = useToast();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      representativeName: "",
      representativePhone: "",
      representativeEmail: "",
      teamName: "",
      players: [{ fullName: "" }],
      remarks: "",
    },
  });

  const { handleSubmit: submitForm, isLoading, error } = useFormSubmit();

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async (data: TeamFormData) => {
    await submitForm(
      async (typedData: unknown) => {
        const teamData = typedData as TeamFormData;
        await onSubmit(teamData);
        showSuccess(`選手登録が完了しました（チーム: ${teamData.teamName}）`);
        router.push(`/teams-form/${orgId}/${tournamentId}/complete`);
      },
      data,
      {
        onError: (error: Error) => {
          showError(`登録に失敗しました: ${error.message}`);
        },
      }
    );
    setShowConfirmation(false);
  };

  const handleConfirmDialog = () => {
    handleSubmit(handleConfirmSubmit)();
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">選手登録フォーム</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">送信エラー</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
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
                  label="チーム名（団体名）"
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
                <CardTitle>備考欄</CardTitle>
              </CardHeader>
              <CardContent>
                <FormTextarea
                  label="自由記述"
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
              <LoadingButton type="submit" isLoading={isLoading}>
                確認画面へ
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isVisible={showConfirmation}
        data={getValues()}
        onConfirm={handleConfirmDialog}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}
