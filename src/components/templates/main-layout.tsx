"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { cn } from "@/lib/utils/utils";
import { AUTH_CONSTANTS, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/providers/notification-provider";
import { HeaderTournamentSelector } from "@/components/molecules/header-tournament-selector";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab?: "matches" | "match-setup" | "teams";
  className?: string;
}

interface HeaderProps {
  activeTab?: "matches" | "match-setup" | "teams";
}

function Header({ activeTab }: HeaderProps) {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut();
      showSuccess("ログアウトしました");

      // ログアウト後、ログイン画面にリダイレクト
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, AUTH_CONSTANTS.LOGOUT_REDIRECT_DELAY);
    } catch {
      showError("ログアウトに失敗しました");
      setShowLogoutConfirm(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleManageTournaments = () => {
    router.push(ROUTES.TOURNAMENT_SETTINGS);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "試合一覧", href: "/dashboard", value: "matches" },
    { label: "試合の組み合わせ設定", href: "/match-setup", value: "match-setup" },
    { label: "チーム・選手管理", href: "/teams", value: "teams" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：ロゴとタイトル + ナビゲーション */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">拳</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 hidden md:block">
                拳法大会管理
              </span>
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
              <TooltipProvider delayDuration={20}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogoutClick}
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

      {/* ログアウト確認ダイアログ */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="ログアウト"
        message="現在ログインしているアカウントからログアウトしますか？"
        confirmText="はい"
        cancelText="キャンセル"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        variant="destructive"
      />
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
      <Header activeTab={activeTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
