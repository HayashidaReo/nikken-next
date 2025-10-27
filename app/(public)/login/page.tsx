import { AuthLayout } from "@/components/templates/auth-layout";
import { LoginForm } from "@/components/organisms/login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">日本拳法大会管理システム</h1>
        <p className="mt-2 text-sm text-gray-600">
          管理者としてログインしてください
        </p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}