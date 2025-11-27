"use client";

import { Button } from "@/components/atoms/button";
import { Download, Monitor, Laptop, CheckCircle2, Command } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GitHubRelease } from "./page";

type DownloadContentProps = {
    release: GitHubRelease | null;
    macArmUrl?: string;
    macIntelUrl?: string;
    winUrl?: string;
};

export function DownloadContent({ release, macArmUrl, macIntelUrl, winUrl }: DownloadContentProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white/20 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 py-24 relative z-10">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-4xl mx-auto space-y-16"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            最新バージョン: {release?.tag_name || "v0.0.0"}
                        </motion.div>

                        <motion.h1 variants={item} className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 pb-2">
                            Nikken Next<br />Desktop App
                        </motion.h1>

                        <motion.p variants={item} className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                            日本拳法の試合管理を、もっとシンプルに、もっと美しく、もっと快適に。<br />
                            ネイティブアプリならではのパフォーマンスを体験してください。
                        </motion.p>
                    </div>

                    {/* Download Cards */}
                    {release ? (
                        <motion.div variants={item} className="grid md:grid-cols-2 gap-6">
                            {/* macOS Card */}
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
                                <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-6 hover:bg-white/5 transition duration-300">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Laptop className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">macOS</h3>
                                        <p className="text-white/50">MacBook Air, Pro, iMac 向け</p>
                                    </div>
                                    <div className="mt-auto space-y-3">
                                        {macArmUrl ? (
                                            <Button asChild className="w-full h-12 bg-white text-black hover:bg-white/90 transition-all font-medium text-base" size="lg">
                                                <Link href={macArmUrl} className="flex items-center justify-center gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Apple Silicon (M1/M2/M3/M4/M5)
                                                </Link>
                                            </Button>
                                        ) : null}
                                        {macIntelUrl ? (
                                            <Button asChild className="w-full h-12 border-white/20 bg-white/10 !text-white hover:!bg-white/50 transition-colors font-medium" size="lg">
                                                <Link href={macIntelUrl} className="flex items-center justify-center gap-2 text-white hover:!text-black">
                                                    <Command className="h-4 w-4" />
                                                    Intel チップ
                                                </Link>
                                            </Button>
                                        ) : null}
                                        {!macArmUrl && !macIntelUrl && (
                                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                                インストーラーが見つかりませんでした
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Windows Card */}
                            <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
                                <div className="relative h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col gap-6 hover:bg-white/5 transition duration-300">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                        <Monitor className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">Windows</h3>
                                        <p className="text-white/50">Windows 10 / 11 (64-bit) 向け</p>
                                    </div>
                                    <div className="mt-auto">
                                        {winUrl ? (
                                            <Button asChild className="w-full h-12 bg-white text-black hover:bg-white/90 transition-all font-medium text-base" size="lg">
                                                <Link href={winUrl} className="flex items-center justify-center gap-2">
                                                    <Download className="h-4 w-4" />
                                                    Windows 版をダウンロード
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                                インストーラーが見つかりませんでした
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div variants={item} className="max-w-md mx-auto">
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4 backdrop-blur-sm">
                                <div className="h-12 w-12 rounded-full bg-white/10 mx-auto flex items-center justify-center">
                                    <Download className="h-6 w-6 text-white/40" />
                                </div>
                                <h3 className="text-xl font-medium">リリース情報が見つかりません</h3>
                                <p className="text-white/50 text-sm">
                                    最新のバージョン情報を取得できませんでした。GitHubから直接ダウンロードしてください。
                                </p>
                                <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5">
                                    <Link href="https://github.com/HayashidaReo/nikken-next/releases">
                                        GitHub Releases
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Features / Note */}
                    <motion.div variants={item} className="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span>自動アップデート</span>
                            </div>
                            <p className="text-sm text-white/50">
                                アプリは自動的に最新バージョンに更新されます。常に最新の機能をご利用いただけます。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                <span>ネイティブパフォーマンス</span>
                            </div>
                            <p className="text-sm text-white/50">
                                OSに最適化されたパフォーマンスで、ブラウザ版よりも快適に動作します。
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <CheckCircle2 className="h-5 w-5 text-purple-500" />
                                <span>安心・安全</span>
                            </div>
                            <p className="text-sm text-white/50">
                                ※ macOSで警告が表示される場合は、右クリックから「開く」を選択してください。
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
