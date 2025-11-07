"use client";

import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";
import { useGuestGuard } from "@/hooks/useAuth";

export default function LoginPage() {
  // useGuestGuard を使用して認証状態をチェック
  useGuestGuard();

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
