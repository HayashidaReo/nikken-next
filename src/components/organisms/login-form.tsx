"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { FormInputField } from "@/components/molecules/form-field";

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

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const {
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // デモ用: コンソールに出力
      console.log("ログイン試行:", data);
      alert("ログイン機能は未実装です");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">ログイン</CardTitle>
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
          
          <FormInputField
            label="パスワード"
            name="password"
            type="password"
            placeholder="パスワードを入力"
            required
            error={errors.password?.message}
          />

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>

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