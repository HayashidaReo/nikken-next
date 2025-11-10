"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { FormInput } from "@/components/molecules/form-input";
import { useToast } from "@/components/providers/notification-provider";
import { AuthService } from "@/lib/auth/service";
import {
  passwordResetSchema,
  type PasswordResetFormData,
} from "@/types/password-reset.schema";

export function PasswordResetForm() {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const handleFormSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);

      // パスワード再設定後のリダイレクト先URL（本番環境とローカル環境で自動切り替え）
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : undefined;

      // パスワードリセットメール送信
      await AuthService.sendPasswordResetEmail(data.email, redirectUrl);

      // 成功時の状態更新
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      showSuccess(`${data.email} にパスワード再設定メールを送信しました。`);
    } catch (error) {
      console.error("Password reset error:", error);

      // AuthServiceのエラーハンドリングを利用
      const errorMessage =
        error instanceof Error
          ? error.message
          : "パスワード再設定メールの送信に失敗しました";

      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div>
              <h2 className="text-2xl font-bold">送信完了</h2>
              <p className="text-muted-foreground mt-2">
                パスワード再設定用のメールを送信しました。
              </p>
            </div>

            <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-4 text-sm">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800 break-all">
                  {submittedEmail}
                </span>
                <br />
                宛に送信されたメールをご確認ください。
              </p>
            </div>

            <div className="text-xs text-gray-500 space-y-1 text-left self-start w-full">
              <p>
                ※
                メールが届かない場合は、迷惑メールフォルダをご確認いただくか、入力したアドレスに誤りがないかご確認ください。
              </p>
            </div>

            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                ログイン画面に戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">パスワード再設定</CardTitle>
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
          <Button type="submit" className="w-full" isLoading={isLoading} loadingText="送信中...">
            再設定メールを送信
          </Button>
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
