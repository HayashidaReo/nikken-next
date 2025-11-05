"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/atoms/tabs";
import { cn } from "@/lib/utils/utils";
import { AUTH_CONSTANTS } from "@/lib/constants";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/notification-provider";
import { TournamentSelector } from "@/components/molecules/TournamentSelector";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: "matches" | "match-setup" | "teams";
  className?: string;
}

function Header() {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("ログアウトしました");

      // ログアウト後、ログイン画面にリダイレクト
      setTimeout(() => {
        router.push("/login");
      }, AUTH_CONSTANTS.LOGOUT_REDIRECT_DELAY);
    } catch {
      showError("ログアウトに失敗しました");
    }
  };

  const handleManageTournaments = () => {
    router.push("/tournament-settings");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：ロゴとタイトル */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">拳</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                拳法大会管理
              </span>
            </Link>
          </div>

          {/* 右側：大会選択と設定ボタン */}
          <div className="flex items-center space-x-4">
            {/* 大会選択ドロップダウン */}
            <TournamentSelector onManageClick={handleManageTournaments} />

            <div className="flex items-center">
              <TooltipProvider delayDuration={20}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      aria-label="ログアウト"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" sideOffset={5}>
                    <p>ログアウト</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MainLayout({
  children,
  activeTab = "matches",
  className,
}: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="mb-8">
            <Link href="/dashboard">
              <TabsTrigger value="matches">試合一覧</TabsTrigger>
            </Link>
            <Link href="/match-setup">
              <TabsTrigger value="match-setup">
                試合の組み合わせ設定
              </TabsTrigger>
            </Link>
            <Link href="/teams">
              <TabsTrigger value="teams">チーム・選手管理</TabsTrigger>
            </Link>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {children}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
