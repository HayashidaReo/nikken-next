"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { AdminSettingsMenu } from "@/components/molecules/admin-settings-menu";

interface AdminHeaderProps {
    className?: string;
}

export function AdminHeader({ className }: AdminHeaderProps) {
    const pathname = usePathname();

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
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === "/organization-management"
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                組織一覧
                            </Link>
                            <Link
                                href="/organization-management/new"
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === "/organization-management/new"
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                新規作成
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
