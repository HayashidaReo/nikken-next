"use client";

import { motion } from "framer-motion";
import { Monitor, Keyboard, Users, Layers, Edit3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ImageModal } from "./image-modal";
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
        className: "md:col-span-2",
        image: "/about/manual_controller.png",
    },
];

export function BentoGrid() {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    return (
        <section id="features" className="py-32 bg-lp-bg relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-lp-text mb-6">
                        世界基準の大会運営に <br />
                        <span className="text-lp-text-muted">必要なすべてを。</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Row 1 */}
                    {/* Hybrid Sync Feature (Spans 2 columns) */}
                    <HybridSyncFeature />

                    {/* Dual Screen (1 column) */}
                    {features.slice(0, 1).map((feature, i) => (
                        <FeatureCard
                            key={i}
                            feature={feature}
                            index={i}
                            onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                        />
                    ))}

                    {/* Row 2 */}
                    {/* Team Management (Spans 2 columns) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className={`group relative overflow-hidden rounded-3xl bg-lp-secondary/30 border border-lp-primary/10 p-8 hover:bg-lp-secondary/50 transition-colors md:col-span-2`}
                    >
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-lp-primary/10 flex items-center justify-center text-lp-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-lp-text mb-2">チーム・選手の管理・申請</h3>
                                <p className="text-lp-text-muted leading-relaxed mb-4">
                                    セキュリティに考慮した専用の申請フォームを作成し、外部に公開。参加チームからの情報をスムーズに収集。<br />
                                    アプリ内からも手動でチームを追加・管理できます。
                                </p>
                            </div>

                            {/* Visual representation of form/app */}
                            <div className="flex gap-4 mt-4 h-48">
                                <div
                                    className="flex-1 relative rounded-xl overflow-hidden border border-white/5 group/image cursor-zoom-in"
                                    onClick={() => setSelectedImage({ src: "/about/team_form.png", alt: "Team Application Form" })}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-lp-bg via-transparent to-transparent z-10 opacity-50 pointer-events-none"></div>
                                    <div className="absolute top-2 left-2 z-20 text-xs font-bold text-lp-text/80 bg-lp-bg/50 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">申請フォーム</div>
                                    <Image
                                        src="/about/team_form.png"
                                        alt="Team Application Form"
                                        fill
                                        className="object-cover opacity-80 group-hover/image:opacity-100 transition-opacity duration-500 group-hover/image:scale-105"
                                    />
                                </div>
                                <div
                                    className="flex-1 relative rounded-xl overflow-hidden border border-white/5 group/image cursor-zoom-in"
                                    onClick={() => setSelectedImage({ src: "/about/team_management.png", alt: "Team Management Dashboard" })}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-lp-bg via-transparent to-transparent z-10 opacity-50 pointer-events-none"></div>
                                    <div className="absolute top-2 left-2 z-20 text-xs font-bold text-lp-text/80 bg-lp-bg/50 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">アプリ管理</div>
                                    <Image
                                        src="/about/team_management.png"
                                        alt="Team Management Dashboard"
                                        fill
                                        className="object-cover opacity-80 group-hover/image:opacity-100 transition-opacity duration-500 group-hover/image:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="absolute -inset-px bg-gradient-to-r from-lp-primary to-lp-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10" />
                    </motion.div>

                    {/* Keyboard Control (1 column) */}
                    {features.slice(1, 2).map((feature, i) => (
                        <FeatureCard
                            key={i + 1}
                            feature={feature}
                            index={i + 1}
                            onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                        />
                    ))}

                    {/* Row 3 */}
                    {features.slice(2, 3).map((feature, i) => (
                        <FeatureCard
                            key={i + 2}
                            feature={feature}
                            index={i + 2}
                            onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                        />
                    ))}

                    {/* Row 4 */}
                    {features.slice(3, 4).map((feature, i) => (
                        <FeatureCard
                            key={i + 3}
                            feature={feature}
                            index={i + 3}
                            onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                        />
                    ))}
                </div>
            </div>

            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageSrc={selectedImage?.src || null}
                imageAlt={selectedImage?.alt || ""}
            />
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

function FeatureCard({ feature, index, onImageClick }: { feature: Feature; index: number; onImageClick: (src: string, alt: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`group relative overflow-hidden rounded-3xl bg-lp-secondary/30 border border-lp-primary/10 p-8 hover:bg-lp-secondary/50 transition-colors ${feature.className}`}
        >
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-lp-primary/10 flex items-center justify-center text-lp-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-lp-text mb-2">{feature.title}</h3>
                    <p className="text-lp-text-muted leading-relaxed">{feature.description}</p>
                </div>

                {feature.image && (
                    <div
                        className="relative w-full h-48 rounded-xl overflow-hidden mt-4 border border-white/5 cursor-zoom-in"
                        onClick={() => feature.image && onImageClick(feature.image, feature.title)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-lp-bg to-transparent z-10 opacity-50 pointer-events-none"></div>
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
            <div className="absolute -inset-px bg-gradient-to-r from-lp-primary to-lp-accent opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10" />
        </motion.div>
    );
}
