"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { FormInput } from "@/components/molecules/form-input";
import { LoadingButton } from "@/components/molecules/loading-button";
import { useToast } from "@/components/providers/notification-provider";
import { organizationCreateWithAccountSchema } from "@/types/organization.schema";
import type { OrganizationCreateWithAccount } from "@/types/organization.schema";

/**
 * 組織作成フォーム
 */
export function OrganizationCreateForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<OrganizationCreateWithAccount>({
        resolver: zodResolver(organizationCreateWithAccountSchema),
        defaultValues: {
            orgName: "",
            representativeName: "",
            representativePhone: "",
            representativeEmail: "",
            adminEmail: "",
            adminPassword: "",
        },
    });

    const onSubmit = async (data: OrganizationCreateWithAccount) => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "組織作成に失敗しました");
            }

            const result = await response.json();
            showSuccess(
                `組織「${result.organization.name}」を作成し、管理者アカウントを発行しました。` +
                `デフォルト大会も自動作成されました。`
            );
            reset(); // フォームをリセット

        } catch (error) {
            showError(error instanceof Error ? error.message : "組織作成に失敗しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>新しい組織を作成</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* 組織情報 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">組織情報</h3>

                        <FormInput
                            label="団体名"
                            name="orgName"
                            required
                            placeholder="○○道場連盟"
                            register={register}
                            error={errors.orgName?.message}
                        />

                        <FormInput
                            label="団体代表者名"
                            name="representativeName"
                            required
                            placeholder="山田太郎"
                            register={register}
                            error={errors.representativeName?.message}
                        />

                        <FormInput
                            label="団体代表者電話番号"
                            name="representativePhone"
                            type="tel"
                            required
                            placeholder="090-1234-5678"
                            register={register}
                            error={errors.representativePhone?.message}
                        />

                        <FormInput
                            label="団体代表者メールアドレス"
                            name="representativeEmail"
                            type="email"
                            required
                            placeholder="representative@example.com"
                            register={register}
                            error={errors.representativeEmail?.message}
                        />
                    </div>

                    {/* 管理者アカウント情報 */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-lg font-medium">管理者アカウント情報</h3>
                        <p className="text-sm text-gray-600">
                            この組織の管理者として使用するログインアカウントを設定します
                        </p>

                        <FormInput
                            label="管理者メールアドレス（ログインID）"
                            name="adminEmail"
                            type="email"
                            required
                            placeholder="admin@example.com"
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

                    <div className="flex gap-4 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => reset()}
                            disabled={isSubmitting}
                        >
                            リセット
                        </Button>
                        <LoadingButton
                            type="submit"
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            組織を作成
                        </LoadingButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}