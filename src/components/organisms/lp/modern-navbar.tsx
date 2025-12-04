"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { MagneticButton } from "@/components/atoms/magnetic-button";

import Image from "next/image";

export function ModernNavbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
        >
            <div className="flex items-center justify-between w-full max-w-5xl px-6 py-3 bg-lp-secondary/30 backdrop-blur-xl border border-lp-primary/10 rounded-full shadow-2xl shadow-black/20">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative">
                        <Image src="/icon.svg" alt="MatcHub Logo" fill className="object-contain p-1" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-lp-text/90 group-hover:text-lp-text transition-colors">
                        MatcHub
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
                            className="text-sm font-medium text-lp-text-muted hover:text-lp-primary transition-colors relative group"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-lp-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <MagneticButton>
                        <Link href="/manual-monitor-control">
                            <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-lp-secondary/50 text-lp-text text-sm font-bold rounded-full hover:bg-lp-secondary transition-colors backdrop-blur-sm border border-lp-primary/10">
                                デモを試す
                            </button>
                        </Link>
                    </MagneticButton>

                    <MagneticButton>
                        <Link href="/login">
                            <button className="flex items-center gap-2 px-5 py-2 bg-lp-blue text-white text-sm font-bold rounded-full hover:bg-lp-blue/90 transition-colors shadow-lg shadow-lp-blue/20">
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
