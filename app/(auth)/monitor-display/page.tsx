"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MonitorDisplayContainer } from "@/components/organisms/monitor-display-container";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";

interface TokenData {
  matchId: string;
  orgId: string;
  tournamentId: string;
}

export default function MonitorDisplayPage() {
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams?.get("pt");

    if (!token) {
      // トークンが提供されていない場合 - 通常のフローを許可（BroadcastChannel/Presentation APIを使用）
      setIsValidating(false);
      return;
    }

    // プレゼンテーション用トークンを検証
    fetch("/api/validate-presentation-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Token validation failed");
        }
        return res.json();
      })
      .then((data) => {
        setTokenData(data);
        setIsValidating(false);
      })
      .catch((err) => {
        console.error("Token validation error:", err);
        setError(err.message || "トークンの検証に失敗しました");
        setIsValidating(false);
      });
  }, [searchParams]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingIndicator message="認証中..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <InfoDisplay
          variant="destructive"
          title="アクセスエラー"
          message={error}
        />
      </div>
    );
  }

  return <MonitorDisplayContainer tokenData={tokenData} />;
}
