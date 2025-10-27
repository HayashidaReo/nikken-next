"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { FormInput } from "@/components/molecules/form-input";
import { LoadingButton } from "@/components/molecules/loading-button";
import { useFormSubmit } from "@/hooks";
import { useToast } from "@/components/providers/notification-provider";

// ログインフォーム用のZodスキーマ
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("正しいメールアドレスを入力してください"),
  password: z
    .string()
    .min(1, "パスワードは必須です")
    .min(6, "パスワードは6文字以上で入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading: externalLoading = false }: LoginFormProps) {
  const { showInfo } = useToast();
  const { handleSubmit: submitForm, isLoading } = useFormSubmit();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    if (onSubmit) {
      await submitForm(
        async (formData: unknown) => {
          const typedData = formData as LoginFormData;
          await onSubmit(typedData);
        },
        data
      );
    } else {
      // デモ用: 通知システムを使用
      showInfo("ログイン機能は未実装です", `ログイン試行: ${data.email}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormInput
            label="メールアドレス"
            name="email"
            type="email"
            placeholder="example@email.com"
            required
            register={register}
            error={errors.email?.message}
          />

          <FormInput
            label="パスワード"
            name="password"
            type="password"
            placeholder="パスワードを入力"
            required
            register={register}
            error={errors.password?.message}
          />

          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={isLoading || externalLoading}
          >
            {isLoading || externalLoading ? "ログイン中..." : "ログイン"}
          </LoadingButton>

          <div className="text-center">
            <Link
              href="/password-reset"
              className="text-sm text-blue-600 hover:underline"
            >
              パスワードを忘れた方はこちら
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}