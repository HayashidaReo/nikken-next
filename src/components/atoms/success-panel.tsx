"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";

interface SuccessPanelProps {
    /** 大きなタイトル */
    title?: string;
    /** サブメッセージ */
    subtitle?: string;
    /** 強調表示するテキスト（例: メールアドレス） */
    highlight?: string;
    /** 補足説明（任意のHTML） */
    note?: React.ReactNode;
    /** CTA ラベル */
    ctaLabel?: string;
    /** CTA のリンク先 */
    ctaHref?: string;
}

export const SuccessPanel: React.FC<SuccessPanelProps> = ({
    title = "完了",
    subtitle,
    highlight,
    note,
    ctaLabel = "戻る",
    ctaHref = "/",
}) => {
    return (
        <div className={cn("flex flex-col items-center text-center space-y-6")}>

            <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
            </div>

            {highlight && (
                <div className="w-full bg-gray-50 border border-gray-200 rounded-md p-4 text-sm">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800 break-all">{highlight}</span>
                        <br />
                        宛に送信されたメールをご確認ください。
                    </p>
                </div>
            )}

            {note && (
                <div className="text-xs text-gray-500 space-y-1 text-left self-start w-full">{note}</div>
            )}

            <Link href={ctaHref} className="w-full">
                <Button variant="outline" className="w-full">
                    {ctaLabel}
                </Button>
            </Link>
        </div>
    );
};

export default SuccessPanel;
