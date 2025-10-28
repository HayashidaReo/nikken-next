"use client";

import { MainLayout } from "@/components/templates/main-layout";
import { MatchListTable } from "@/components/organisms/match-list-table";
import { mockMatches, mockTournament } from "@/lib/mock-data";
import { useAuthGuard, useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/atoms/button";
import { useToast } from "@/components/providers/notification-provider";

export default function DashboardPage() {
  const { user, isLoading, displayName } = useAuthGuard();
  const { showSuccess, showError } = useToast();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("ログアウトしました");
    } catch (error) {
      console.error("Logout error:", error);
      showError("ログアウトに失敗しました");
    }
  };

  // 認証チェック中はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      activeTab="matches"
      tournamentName={mockTournament.tournamentName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">試合一覧</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                ようこそ、{displayName}さん
              </p>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline">
            ログアウト
          </Button>
        </div>

        <MatchListTable
          matches={mockMatches}
          tournamentName={mockTournament.tournamentName}
        />
      </div>
    </MainLayout>
  );
}
