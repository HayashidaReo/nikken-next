"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";

import { cn } from "@/lib/utils/utils";
import {
  ConfirmationDialog,
  PlayerListForm,
  FormInput,
  FormTextarea,
} from "@/components/molecules";
import type { TeamFormData } from "@/types/team-form.schema";
import { teamFormSchema } from "@/types/team-form.schema";
import { useFormSubmit } from "@/hooks";
import { useToast } from "@/components/providers/notification-provider";
import { defaultTeamFormValues } from "@/lib/form-defaults";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

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
    setFocus,
    formState: { errors, isDirty },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: defaultTeamFormValues,
  });

  // ブラウザのリロード/閉じる操作に対する警告
  useUnsavedChanges(isDirty);

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
    // バリデーションはダイアログ表示前に済んでいるため、直接送信処理を実行
    handleConfirmSubmit(getValues());
  };

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-900">出場チーム申請フォーム</h2>
          <p className="text-gray-500 mt-2">
            以下のフォームに必要な情報を入力して、申請を行ってください。
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="text-red-500 mt-0.5">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">送信エラー</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-10">
          {/* 代表者情報 */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">代表者情報</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="代表者名"
                name="representativeName"
                required
                placeholder="山田太郎"
                register={register}
                error={errors.representativeName?.message}
                inputClassName="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />

              <FormInput
                label="代表者電話番号"
                name="representativePhone"
                type="tel"
                required
                placeholder="090-1234-5678"
                register={register}
                error={errors.representativePhone?.message}
                inputClassName="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />

              <FormInput
                label="代表者メールアドレス"
                name="representativeEmail"
                type="email"
                required
                placeholder="example@email.com"
                className="md:col-span-2"
                inputClassName="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                register={register}
                error={errors.representativeEmail?.message}
              />
            </div>
          </section>

          {/* チーム情報 */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">チーム情報</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormInput
                label="チーム名（団体名）"
                name="teamName"
                required
                placeholder="○○道場 / ○○大学"
                register={register}
                error={errors.teamName?.message}
                inputClassName="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </section>

          {/* 選手一覧 */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">選手一覧</h3>
            </div>

            <PlayerListForm
              control={control}
              errors={errors}
              register={register}
              setFocus={setFocus}
            />
          </section>

          {/* 備考 */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-blue-600 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-900">備考欄</h3>
            </div>

            <FormTextarea
              label="自由記述"
              name="remarks"
              placeholder="特別な配慮事項や連絡事項があれば記入してください"
              rows={4}
              register={register}
              textareaClassName="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </section>

          <div className="pt-6 border-t border-gray-100 flex gap-4 justify-end">
            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="準備中..."
              className="px-8 h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              確認画面へ
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isVisible={showConfirmation}
        data={getValues()}
        onConfirm={handleConfirmDialog}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isLoading}
      />
    </div>
  );
}
