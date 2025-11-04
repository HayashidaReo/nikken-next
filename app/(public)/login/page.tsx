"use client";

import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { useGuestGuard } from "@/hooks/useAuth";

export default function LoginPage() {
  const { isLoading } = useGuestGuard();

  // 認証チェック中はローディング表示
  if (isLoading) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          日本拳法大会管理システム
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          管理者としてログインしてください
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
