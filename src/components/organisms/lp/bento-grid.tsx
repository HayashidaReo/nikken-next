"use client";

import { motion } from "framer-motion";
import { WifiOff, Monitor, Keyboard, Cloud } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: "オフラインファースト",
        description: "インターネットなしで完璧に動作。オンライン復帰時にデータは同期可能です。",
        icon: <WifiOff className="w-6 h-6" />,
        className: "md:col-span-2",
        image: "/about/match_list_dashboard.png",
    },
    {
        title: "デュアルスクリーン",
        description: "HDMI/AirPlay経由でプロ仕様のスコアボードを表示。",
        icon: <Monitor className="w-6 h-6" />,
        className: "md:col-span-1",
        image: "/about/dual_monitor_setup.png",
    },
    {
        title: "リアルタイム同期",
        description: "会場内の全デバイスで瞬時に情報を更新。",
        icon: <Cloud className="w-6 h-6" />,
        className: "md:col-span-1",
        image: null,
    },
    {
        title: "キーボード操作",
        description: "素早いスコア入力のための最適化されたショートカット。",
        icon: <Keyboard className="w-6 h-6" />,
        className: "md:col-span-2",
        image: "/about/monitor_controller.png",
    },
];

export function BentoGrid() {
    return (
        <section id="features" className="py-32 bg-[#0a0a0a] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        世界基準の大会運営に <br />
                        <span className="text-gray-500">必要なすべてを。</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors ${feature.className}`}
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>

                                {feature.image && (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden mt-4 border border-white/5">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 opacity-50"></div>
                                        <Image
                                            src={feature.image}
                                            alt={feature.title}
                                            fill
                                            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Glow Effect */}
                            <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
