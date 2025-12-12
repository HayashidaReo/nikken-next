"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/molecules/form-input";
import { Button } from "@/components/atoms/button";
import { useToast } from "@/components/providers/notification-provider";
import { organizationCreateWithAccountSchema } from "@/types/organization.schema";
import type { OrganizationCreateWithAccount } from "@/types/organization.schema";
import { useCreateOrganization } from "@/queries/use-organizations";
import { defaultOrganizationCreateValues } from "@/lib/form-defaults";

/**
 * 組織作成フォーム
 */
export function OrganizationCreateForm() {
  const { showSuccess, showError } = useToast();
  const createOrganizationMutation = useCreateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationCreateWithAccount>({
    resolver: zodResolver(organizationCreateWithAccountSchema),
    defaultValues: defaultOrganizationCreateValues,
  });

  const onSubmit = async (data: OrganizationCreateWithAccount) => {
    try {
      const result = await createOrganizationMutation.mutateAsync(data);
      showSuccess(
        `組織「${result.orgName}」を作成し、管理者アカウントを発行しました。` +
        `デフォルト大会も自動作成されました。`
      );
      reset(); // フォームをリセット
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "組織作成に失敗しました"
      );
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 組織情報 */}
        <section className="space-y-4">
          <div className="pb-2 border-b">
            <h3 className="text-lg font-medium text-gray-900">組織情報</h3>
            <p className="text-sm text-gray-500">
              作成する組織の基本情報を入力してください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormInput
                label="団体名"
                name="orgName"
                required
                placeholder="例: ○○道場連盟"
                register={register}
                error={errors.orgName?.message}
                className="max-w-xl"
              />
            </div>

            <FormInput
              label="団体代表者名"
              name="representativeName"
              required
              placeholder="例: 山田太郎"
              register={register}
              error={errors.representativeName?.message}
            />

            <FormInput
              label="団体代表者電話番号"
              name="representativePhone"
              type="tel"
              required
              placeholder="例: 090-1234-5678"
              register={register}
              error={errors.representativePhone?.message}
            />

            <FormInput
              label="団体代表者メールアドレス"
              name="representativeEmail"
              type="email"
              required
              placeholder="例: representative@example.com"
              register={register}
              error={errors.representativeEmail?.message}
              className="md:col-span-2 max-w-xl"
            />
          </div>
        </section>

        {/* 管理者アカウント情報 */}
        <section className="space-y-4">
          <div className="pb-2 border-b">
            <h3 className="text-lg font-medium text-gray-900">管理者アカウント</h3>
            <p className="text-sm text-gray-500">
              この組織の管理者として使用するログイン情報を設定します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="管理者メールアドレス（ログインID）"
              name="adminEmail"
              type="email"
              required
              placeholder="例: admin@example.com"
              register={register}
              error={errors.adminEmail?.message}
            />

            <FormInput
              label="初期パスワード"
              name="adminPassword"
              type="password"
              required
              placeholder="6文字以上"
              register={register}
              error={errors.adminPassword?.message}
            />
          </div>
        </section>

        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset()}
            disabled={createOrganizationMutation.isPending}
          >
            入力内容をクリア
          </Button>
          <Button
            type="submit"
            className="min-w-[160px]"
            isLoading={createOrganizationMutation.isPending}
            loadingText="作成中..."
            disabled={createOrganizationMutation.isPending}
          >
            組織を作成する
          </Button>
        </div>
      </form>
    </div>
  );
}
