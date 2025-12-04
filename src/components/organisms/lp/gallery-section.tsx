"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import galleryData from "@/data/lp-gallery.json";
import { useRef } from "react";

export function GallerySection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <section id="gallery" className="py-32 bg-lp-bg relative border-t border-white/5">
            <div className="container mx-auto px-4 relative z-10 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-lp-text mb-6">
                        ギャラリー
                    </h2>
                    <p className="text-lp-text-muted max-w-2xl mx-auto">
                        MatcHubの体験をご覧ください。
                    </p>
                </motion.div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-12 px-4 md:px-8 snap-x snap-mandatory"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}
            >
                {/* Spacer for left padding visual balance if needed, or just rely on px */}
                <div className="w-0 md:w-12 flex-none" />

                {galleryData.map((item, index) => (
                    <motion.div
                        key={index}
                        className="flex-none w-[85vw] md:w-[600px] aspect-[2704/1696] relative rounded-2xl overflow-hidden border border-white/10 bg-lp-secondary/30 snap-center group"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true, root: scrollRef }}
                    >
                        <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-lp-bg/90 via-lp-bg/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                            <h3 className="text-xl font-bold text-lp-text mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                {item.title}
                            </h3>
                            <p className="text-lp-text-muted text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                {item.description}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {/* Spacer for right padding */}
                <div className="w-0 md:w-12 flex-none" />
            </div>

            {/* Custom Scrollbar Indicator (Optional, simpler to just hide for now as per "Awwwards" clean style) */}
        </section>
    );
}
