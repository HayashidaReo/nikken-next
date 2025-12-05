"use client";

import { motion } from "framer-motion";
import { Edit3, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface InstantModeCardProps {
    onImageClick: (src: string, alt: string) => void;
}

export function InstantModeCard({ onImageClick }: InstantModeCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl bg-lp-secondary/30 border border-lp-primary/10 p-8 hover:bg-lp-secondary/50 transition-colors md:col-span-2 flex flex-col justify-between"
        >
            {/* Top: Text Content */}
            <div className="relative z-10 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-lp-primary/10 flex items-center justify-center text-lp-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Edit3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-lp-text mb-2">登録不要の即席モード</h3>
                <p className="text-lp-text-muted leading-relaxed max-w-2xl">
                    選手名などを操作画面でそのまま入力することで、登録なしに誰でも得点板を使用することができます。
                </p>
            </div>

            {/* Bottom: Button and Image */}
            <div className="relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
                <Link href="/manual-monitor-control" className="mb-4 md:mb-8">
                    <button className="flex items-center gap-2 px-6 py-3 bg-lp-blue text-white text-sm font-bold rounded-full hover:bg-lp-blue/90 transition-colors shadow-lg shadow-lp-primary/20">
                        早速使ってみる
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>

                <div
                    className="w-full md:w-1/2 aspect-[2704/1696] relative rounded-xl overflow-hidden border border-white/5 cursor-zoom-in"
                    onClick={() => onImageClick("/about/manual_controller.png", "Instant Mode")}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-lp-bg to-transparent z-10 opacity-50 pointer-events-none"></div>
                    <Image
                        src="/about/manual_controller.png"
                        alt="Instant Mode"
                        fill
                        className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105"
                    />
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-lp-primary to-lp-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10" />
        </motion.div>
    );
}
