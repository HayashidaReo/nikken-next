import * as React from "react";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/atoms/tabs";
import { cn } from "@/lib/utils/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  tournamentName?: string;
  activeTab?: "matches" | "match-setup" | "teams";
  className?: string;
}

interface HeaderProps {
  tournamentName?: string;
}

function Header({ tournamentName = "第50回全国日本拳法大会" }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側：ロゴエリア */}
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

          {/* 右側：大会名と設定ボタン */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 font-medium">
              {tournamentName}
            </span>
            <div className="flex items-center space-x-2">
              <Link href="/tournament-settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  大会設定
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MainLayout({
  children,
  tournamentName,
  activeTab = "matches",
  className,
}: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      <Header tournamentName={tournamentName} />

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
