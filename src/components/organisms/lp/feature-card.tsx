"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

export interface Feature {
    title: string;
    description: string;
    icon: ReactNode;
    className: string;
    image: string | null;
}

interface FeatureCardProps {
    feature: Feature;
    index: number;
    onImageClick: (src: string, alt: string) => void;
}

export function FeatureCard({ feature, index, onImageClick }: FeatureCardProps) {
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
