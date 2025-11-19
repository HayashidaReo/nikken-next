"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MonitorDisplayContainer } from "@/components/organisms/monitor-display-container";
import { LoadingIndicator } from "@/components/molecules/loading-indicator";
import { InfoDisplay } from "@/components/molecules/info-display";
import { useValidatePresentationToken } from "@/queries/use-presentation";

interface TokenData {
  matchId: string;
  orgId: string;
  tournamentId: string;
}

export default function MonitorDisplayPage() {
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const validatePresentationToken = useValidatePresentationToken();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams?.get("pt");

    if (!token) {
      // トークンが提供されていない場合 - 通常のフローを許可（BroadcastChannel/Presentation APIを使用）
      setTimeout(() => setIsValidating(false), 0);
      return;
    }

    // プレゼンテーション用トークンを検証
    validatePresentationToken.mutate(token, {
      onSuccess: (data) => {
        setTokenData(data);
        setIsValidating(false);
      },
      onError: (err) => {
        console.error("Token validation error:", err);
        setError(err.message || "トークンの検証に失敗しました");
        setIsValidating(false);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
