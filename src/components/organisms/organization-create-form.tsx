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
import { useFormEnterNavigation } from "@/hooks/useFormEnterNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Building2, ShieldCheck } from "lucide-react";

/**
 * 組織作成フォーム
 */
export function OrganizationCreateForm() {
  const { showSuccess, showError } = useToast();
  const createOrganizationMutation = useCreateOrganization();
  const { handleKeyDown } = useFormEnterNavigation();

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
      await createOrganizationMutation.mutateAsync(data);
      showSuccess(
        `組織「${data.orgName}」を作成し、管理者アカウントを発行しました。` +
        `デフォルト大会も自動作成されました。`
      );
      reset();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "組織作成に失敗しました"
      );
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-8">
        <div className="grid gap-8">
          {/* 組織情報 */}
          <Card>
            <CardHeader className="pb-4 border-b bg-gray-50/40">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">組織基本情報</CardTitle>
                  <CardDescription>
                    作成する組織（団体）の基本情報を入力してください
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="団体名"
                  name="orgName"
                  required
                  placeholder="例: ○○道場連盟"
                  register={register}
                  error={errors.orgName?.message}
                />

                <FormInput
                  label="代表者名"
                  name="representativeName"
                  required
                  placeholder="例: 山田 太郎"
                  register={register}
                  error={errors.representativeName?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="代表者電話番号"
                  name="representativePhone"
                  type="tel"
                  required
                  placeholder="例: 090-1234-5678"
                  register={register}
                  error={errors.representativePhone?.message}
                />

                <FormInput
                  label="代表者メールアドレス"
                  name="representativeEmail"
                  type="email"
                  required
                  placeholder="例: representative@example.com"
                  register={register}
                  error={errors.representativeEmail?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* 管理者アカウント情報 */}
          <Card>
            <CardHeader className="pb-4 border-b bg-gray-50/40">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">管理者アカウント設定</CardTitle>
                  <CardDescription>
                    この組織の初回ログインに使用する管理者アカウントを設定します
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="ログインID (メールアドレス)"
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
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset()}
            disabled={createOrganizationMutation.isPending}
            className="text-gray-500 hover:text-gray-700"
          >
            入力内容をクリア
          </Button>
          <Button
            type="submit"
            className="min-w-[200px] shadow-sm"
            size="lg"
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
