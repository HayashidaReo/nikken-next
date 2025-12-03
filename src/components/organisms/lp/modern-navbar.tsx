"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { MagneticButton } from "@/components/atoms/magnetic-button";

export function ModernNavbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
        >
            <div className="flex items-center justify-between w-full max-w-5xl px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white/90 group-hover:text-white transition-colors">
                        Nikken Next
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {[
                        { label: "機能", href: "#features" },
                        { label: "ギャラリー", href: "#gallery" },
                        { label: "ダウンロード", href: "/download" },
                        { label: "お問い合わせ", href: "/contact" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="text-sm font-medium text-white/60 hover:text-white transition-colors relative group"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <MagneticButton>
                        <Link href="/manual-monitor-control">
                            <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-white/10 text-white text-sm font-bold rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                                デモを試す
                            </button>
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link href="/login">
                            <button className="flex items-center gap-2 px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-blue-50 transition-colors">
                                <LogIn className="w-4 h-4" />
                                ログイン
                            </button>
                        </Link>
                    </MagneticButton>
                </div>
            </div>
        </motion.nav>
    );
}
