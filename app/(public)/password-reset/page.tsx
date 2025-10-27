import { AuthLayout } from "@/components/templates/auth-layout";
import { PasswordResetForm } from "@/components/organisms/password-reset-form";

export default function PasswordResetPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">パスワード再設定</h1>
        <p className="mt-2 text-sm text-gray-600">
          登録済みのメールアドレスを入力してください
        </p>
      </div>
      <PasswordResetForm />
    </AuthLayout>
  );
}
