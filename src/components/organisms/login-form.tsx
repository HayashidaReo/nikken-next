"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { FormInput } from "@/components/molecules/form-input";
import { LoadingButton } from "@/components/molecules/loading-button";
import { useToast } from "@/components/providers/notification-provider";
import { useAuthStore } from "@/store/use-auth-store";

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

export function LoginForm() {
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // エラーをクリアする（入力時）
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      showSuccess("ログインしました");
      router.push("/dashboard");
    } catch (err) {
      // エラーはAuthStoreで管理されているのでここでは何もしない
      // ToastはAuthStoreのエラーメッセージを表示
      if (err instanceof Error) {
        showError(err.message);
      }
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

          {/* 認証エラーの表示 */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <LoadingButton
            type="submit"
            className="w-full"
            isLoading={isLoading}
            loadingText="ログイン中..."
          >
            ログイン
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
