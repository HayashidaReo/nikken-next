"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/utils";
import { AdminSettingsMenu } from "@/components/molecules/admin-settings-menu";

interface AdminHeaderProps {
    className?: string;
}

export function AdminHeader({ className }: AdminHeaderProps) {
    return (
        <header className={cn("bg-white shadow-sm sticky top-0 z-50", className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 左側：タイトル */}
                    <div className="flex items-center gap-8">
                        <Link href="/organization-management" className="flex items-center space-x-3 flex-shrink-0">
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-900 leading-none">
                                    管理者画面
                                </span>
                            </div>
                        </Link>

                        {/* ナビゲーション */}
                        <nav className="hidden md:flex space-x-1">
                            <Link
                                href="/organization-management"
                                className="px-3 py-2 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-900"
                            >
                                組織一覧
                            </Link>
                        </nav>
                    </div>

                    {/* 右側：設定メニュー */}
                    <div className="flex items-center space-x-4">
                        <AdminSettingsMenu />
                    </div>
                </div>
            </div>
        </header>
    );
}
