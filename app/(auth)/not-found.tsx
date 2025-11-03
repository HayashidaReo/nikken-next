"use client";

import Link from "next/link";
import { Home, Search, Settings } from "lucide-react";
import { Button } from "@/components/atoms/button";

export default function AuthNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                        ページが見つかりません
                    </h2>
                    <p className="text-gray-600">
                        申し訳ございませんが、お探しのページは存在しないか、移動または削除された可能性があります。
                    </p>
                </div>

                <div className="space-y-4">
                    <Link href="/dashboard" className="block">
                        <Button className="w-full" size="lg">
                            <Home className="w-5 h-5 mr-2" />
                            ダッシュボードに戻る
                        </Button>
                    </Link>

                    <Link href="/teams" className="block">
                        <Button variant="outline" className="w-full" size="lg">
                            <Search className="w-5 h-5 mr-2" />
                            チーム管理
                        </Button>
                    </Link>

                    <Link href="/tournament-settings" className="block">
                        <Button variant="outline" className="w-full" size="lg">
                            <Settings className="w-5 h-5 mr-2" />
                            大会設定
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <p>
                        問題が続く場合は、管理者までお問い合わせください。
                    </p>
                </div>
            </div>
        </div>
    );
}