"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/atoms/button";

interface PublicNotFoundContentProps {
    onRetry?: () => void;
    title?: string;
    description?: string;
    showRetryButton?: boolean;
    showContactInfo?: boolean;
}

export function PublicNotFoundContent({
    onRetry,
    title = "URLが正しくありません",
    description = "指定されたページまたは大会情報が見つかりません。URLをもう一度ご確認ください。",
    showRetryButton = true,
    showContactInfo = true,
}: PublicNotFoundContentProps) {
    const router = useRouter();
    const [originalUrl] = useState<string | null>(() => {
        // 初期化時にセッションストレージから元のURLを取得
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('originalUrl');
        }
        return null;
    });

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else if (originalUrl) {
            // セッションストレージをクリア
            sessionStorage.removeItem('originalUrl');
            // 元のURLに戻る
            router.push(originalUrl);
        } else {
            // フォールバックとしてリロード
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="w-16 h-16 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {title}
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {description}
                    </p>
                </div>

                {showRetryButton && (
                    <div className="space-y-4 mb-8">
                        <Button
                            onClick={handleRetry}
                            className="w-full"
                            size="lg"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            再度お試しください
                        </Button>
                    </div>
                )}

                {showContactInfo && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                            <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-left">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                    問題が続く場合
                                </h3>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    上記の方法で解決しない場合は、大会運営者までお問い合わせください。
                                    正しいURLをご案内いたします。
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-400">
                    <p>
                        このページは自動的に生成されました
                    </p>
                </div>
            </div>
        </div>
    );
}