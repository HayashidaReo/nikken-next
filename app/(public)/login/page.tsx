"use client";

import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { useGuestGuard } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";

export default function LoginPage() {
  // useGuestGuard を使用して認証状態をチェック
  const { isLoading } = useGuestGuard();

  // 認証チェック中はローディング表示
  if (isLoading) {
    return (
      <LoadingIndicator
        message="認証状態を確認中..."
        size="lg"
        fullScreen={true}
      />
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          日本拳法大会管理システム
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          大会運営者としてログインしてください
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
