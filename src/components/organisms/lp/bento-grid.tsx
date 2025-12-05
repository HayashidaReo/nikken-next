"use client";

import { motion } from "framer-motion";
import { Monitor, Keyboard, Layers } from "lucide-react";
import { useState } from "react";
import { ImageModal } from "./image-modal";
import { HybridSyncFeature } from "./hybrid-sync-feature";
import { FeatureCard, Feature } from "./feature-card";
import { TeamManagementCard } from "./team-management-card";
import { InstantModeCard } from "./instant-mode-card";


const features: Feature[] = [
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
                    {/* Dual Screen (1 column) */}
                    {features.slice(0, 1).map((feature, i) => (
                        <FeatureCard
                            key={i}
                            feature={feature}
                            index={i}
                            onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                        />
                    ))}

                    {/* Hybrid Sync Feature (Spans 2 columns) */}
                    <HybridSyncFeature />

                    {/* Row 2 */}
                    {/* Team Management (Spans 2 columns) */}
                    <TeamManagementCard onImageClick={(src, alt) => setSelectedImage({ src, alt })} />

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

                    {/* Instant Mode Custom Card (Spans 2 columns) */}
                    <InstantModeCard onImageClick={(src, alt) => setSelectedImage({ src, alt })} />
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
