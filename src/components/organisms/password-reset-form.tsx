"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { FormInputField } from "@/components/molecules/form-field";

// パスワード再設定フォーム用のZodスキーマ
const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスは必須です")
    .email("正しいメールアドレスを入力してください"),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  onSubmit?: (data: PasswordResetFormData) => Promise<void>;
  isLoading?: boolean;
  isSubmitted?: boolean;
  submittedEmail?: string;
}

export function PasswordResetForm({ 
  onSubmit, 
  isLoading = false,
  isSubmitted = false,
  submittedEmail
}: PasswordResetFormProps) {
  const {
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const handleFormSubmit = async (data: PasswordResetFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // デモ用: コンソールに出力
      console.log("パスワード再設定メール送信:", data);
      alert(`${data.email}にパスワード再設定メールを送信しました。`);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">メール送信完了</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {submittedEmail} にパスワード再設定用のメールを送信しました。
          </p>
          <p className="text-sm text-gray-600">
            メールに記載されたリンクをクリックしてパスワードを再設定してください。
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              ログイン画面に戻る
            </Button>
          </Link>
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
                      <FormInputField
              label="メールアドレス"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              error={errors.email?.message}
            />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "送信中..." : "再設定メールを送信"}
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