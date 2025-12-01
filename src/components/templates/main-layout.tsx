"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/lib/utils/utils";
import { APP_INFO, ROUTES } from "@/lib/constants";
import { HeaderTournamentSelector } from "@/components/molecules/header-tournament-selector";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { isElectron } from "@/lib/utils/platform";
import { SettingsMenu } from "@/components/molecules/settings-menu";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";



interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: "matches" | "match-setup" | "teams" | "manual-monitor" | "download";
  className?: string;
}

interface HeaderProps {
  activeTab?: "matches" | "match-setup" | "teams" | "manual-monitor" | "download";
}

// ナビゲーション項目の定義（定数として定義）
const ALL_NAV_ITEMS = [
  { label: "試合一覧", href: "/dashboard", value: "matches" as const },
  { label: "試合の組み合わせ設定", href: "/match-setup", value: "match-setup" as const },
  { label: "チーム・選手管理", href: "/teams", value: "teams" as const },
  { label: "手動モニター", href: "/manual-monitor-control", value: "manual-monitor" as const },
  { label: "ダウンロード", href: "/download", value: "download" as const },
];

function Header({ activeTab }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isOnline = useOnlineStatus();

  const handleManageTournaments = () => {
    router.push(ROUTES.TOURNAMENT_SETTINGS);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Electronアプリの場合はダウンロード項目を除外
  const navItems = React.useMemo(() => {
    if (isElectron()) {
      return ALL_NAV_ITEMS.filter((item) => item.value !== "download");
    }
    return ALL_NAV_ITEMS;
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：タイトル + バージョン */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
              <div className="hidden md:flex flex-col">
                <span className="text-lg font-semibold text-gray-900 leading-none">
                  拳法大会管理
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  v{APP_INFO.VERSION}
                </span>
              </div>
              {!isOnline && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center text-red-600 ml-2">
                        <WifiOff className="w-5 h-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>オフラインモード</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Link>

            {/* PC用ナビゲーション */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === item.value
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 右側：大会選択と設定ボタン */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* 大会選択ドロップダウン */}
            <div className="block">
              <HeaderTournamentSelector onManageClick={handleManageTournaments} />
            </div>

            <div className="flex items-center">
              <SettingsMenu />
            </div>

            {/* モバイル用ハンバーガーメニューボタン */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="メニューを開く"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用メニューオーバーレイ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.value}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "px-3 py-2 rounded-md text-base font-medium transition-colors",
                      activeTab === item.value
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function MainLayout({
  children,
  activeTab = "matches",
  className,
}: MainLayoutProps) {
  // リアルタイム同期の有効化
  useFirestoreSync();

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <Header activeTab={activeTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
