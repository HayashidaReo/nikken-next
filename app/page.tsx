"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 初期化完了まで待機
    if (isLoading) return;

    if (user) {
      // ログイン済みならダッシュボードへ
      router.replace("/dashboard");
    } else {
      // 未ログインならログイン画面へ
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // 判定中はローディングを表示
  return (
    <LoadingIndicator
      fullScreen
      message="認証情報を確認中..."
      size="lg"
    />
  );
}
