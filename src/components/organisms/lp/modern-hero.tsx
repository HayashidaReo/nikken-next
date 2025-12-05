"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ModernHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-lp-bg">
            {/* Background Elements */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-lp-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-lp-accent/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20"></div>
            </div>

            <motion.div
                style={{ y, opacity }}
                className="relative z-10 container mx-auto px-4 text-center"
            >

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-lp-text mb-8"
                >
                    日本拳法大会運営の <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lp-primary via-lp-accent to-purple-400 animate-gradient-x">
                        未来形
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-lp-text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    完全オフライン対応。外部ディスプレイ表示。リアルタイム同期。
                    <br />
                    次世代の大会運営を体験してください。
                </motion.p>
            </motion.div>
        </section>
    );
}
