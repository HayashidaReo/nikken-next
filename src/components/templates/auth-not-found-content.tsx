"use client";

import Link from "next/link";
import { Home, Search, Settings } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { NotFoundLayout } from "./not-found-layout";

interface AuthNotFoundContentProps {
  title?: string;
  subtitle?: string;
  description?: string;
  showDashboardLink?: boolean;
  showTeamsLink?: boolean;
  showSettingsLink?: boolean;
}

export function AuthNotFoundContent({
  title = "404",
  subtitle = "ページが見つかりません",
  description = "申し訳ございませんが、お探しのページは存在しないか、移動または削除された可能性があります。",
  showDashboardLink = true,
  showTeamsLink = true,
  showSettingsLink = true,
}: AuthNotFoundContentProps) {
  const actions = (
    <>
      {showDashboardLink && (
        <Link href="/dashboard" className="block">
          <Button className="w-full" size="lg">
            <Home className="w-5 h-5 mr-2" />
            ダッシュボードに戻る
          </Button>
        </Link>
      )}

      {showTeamsLink && (
        <Link href="/teams" className="block">
          <Button variant="outline" className="w-full" size="lg">
            <Search className="w-5 h-5 mr-2" />
            チーム管理
          </Button>
        </Link>
      )}

      {showSettingsLink && (
        <Link href="/tournament-settings" className="block">
          <Button variant="outline" className="w-full" size="lg">
            <Settings className="w-5 h-5 mr-2" />
            大会設定
          </Button>
        </Link>
      )}
    </>
  );

  const footer = <p>問題が続く場合は、管理者までお問い合わせください。</p>;

  return (
    <NotFoundLayout
      icon={<div className="text-6xl font-bold text-gray-900">{title}</div>}
      title={subtitle || ""}
      description={description}
      actions={actions}
      footer={footer}
      maxWidth="md"
    />
  );
}
