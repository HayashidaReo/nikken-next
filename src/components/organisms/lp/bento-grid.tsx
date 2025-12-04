"use client";

import { motion } from "framer-motion";
import { Monitor, Keyboard, Users, Layers, Edit3 } from "lucide-react";
import Image from "next/image";

import { HybridSyncFeature } from "./hybrid-sync-feature";

const features = [
    {
        title: "外部ディスプレイ表示",
        description: "HDMI/AirPlay経由でプロ仕様のスコアボードをモニターに表示。",
        icon: <Monitor className="w-6 h-6" />,
        className: "md:col-span-1",
        image: "/about/scoreboard_monitor.png",
    },
    {
        title: "直感的なモニター操作",
        description: "素早いスコア入力のための最適化されたショートカット。操作性の良いパネル配置。",
        icon: <Keyboard className="w-6 h-6" />,
        className: "md:col-span-1",
        image: "/about/controller.png",
    },
    {
        title: "複数大会の同時管理",
        description: "複数の大会を作成し、並行して進行状況を管理できます。",
        icon: <Layers className="w-6 h-6" />,
        className: "md:col-span-1",
        image: "/about/tournaments_management.png",
    },
    {
        title: "登録不要の即席モード",
        description: "選手名などを操作画面でそのまま入力することで、登録なしに誰でも得点板を使用することができます。",
        icon: <Edit3 className="w-6 h-6" />,
        className: "md:col-span-3",
        image: "/about/monitor_display_hero.png",
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
                    {/* Row 1 */}
                    {/* Hybrid Sync Feature (Spans 2 columns) */}
                    <HybridSyncFeature />

                    {/* Dual Screen (1 column) */}
                    {features.slice(0, 1).map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}

                    {/* Row 2 */}
                    {/* Team Management (Spans 2 columns) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className={`group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors md:col-span-2`}
                    >
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">チーム・選手の管理・申請</h3>
                                <p className="text-gray-400 leading-relaxed mb-4">
                                    セキュリティに考慮した専用の申請フォームを作成し、外部に公開。参加チームからの情報をスムーズに収集。<br />
                                    アプリ内からも手動でチームを追加・管理できます。
                                </p>
                            </div>

                            {/* Visual representation of form/app */}
                            <div className="flex gap-4 mt-4 h-48">
                                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 group/image">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 opacity-50"></div>
                                    <div className="absolute top-2 left-2 z-20 text-xs font-bold text-white/80 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">申請フォーム</div>
                                    <Image
                                        src="/about/team_form.png"
                                        alt="Team Application Form"
                                        fill
                                        className="object-cover opacity-80 group-hover/image:opacity-100 transition-opacity duration-500 group-hover/image:scale-105"
                                    />
                                </div>
                                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 group/image">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 opacity-50"></div>
                                    <div className="absolute top-2 left-2 z-20 text-xs font-bold text-white/80 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">アプリ管理</div>
                                    <Image
                                        src="/about/team_management.png"
                                        alt="Team Management Dashboard"
                                        fill
                                        className="object-cover opacity-80 group-hover/image:opacity-100 transition-opacity duration-500 group-hover/image:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10" />
                    </motion.div>

                    {/* Keyboard Control (1 column) */}
                    {features.slice(1, 2).map((feature, i) => (
                        <FeatureCard key={i + 1} feature={feature} index={i + 1} />
                    ))}

                    {/* Row 3 */}
                    {features.slice(2, 3).map((feature, i) => (
                        <FeatureCard key={i + 2} feature={feature} index={i + 2} />
                    ))}

                    {/* Row 4 */}
                    {features.slice(3, 4).map((feature, i) => (
                        <FeatureCard key={i + 3} feature={feature} index={i + 3} />
                    ))}
                </div>
            </div>
        </section>
    );
}

interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
    className: string;
    image: string | null;
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
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
    );
}
