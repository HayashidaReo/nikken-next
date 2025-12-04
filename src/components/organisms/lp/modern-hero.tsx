"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lp-secondary/50 border border-lp-primary/20 text-lp-primary text-xs font-medium mb-8 backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lp-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-lp-primary"></span>
                    </span>
                    v1.0 リリース
                </motion.div>

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
                    オフラインファースト。デュアルモニター対応。リアルタイム同期。
                    <br />
                    次世代の大会運営を体験してください。
                </motion.p>

                {/* CTAs moved to Navbar */}

                {/* Floating UI Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="mt-20 mx-auto max-w-5xl relative perspective-1000"
                >
                    <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-lp-primary/10 bg-lp-secondary">
                        <div className="absolute inset-0 bg-gradient-to-tr from-lp-primary/5 to-lp-accent/5 pointer-events-none z-10"></div>
                        <Image
                            src="/about/hero_v2.png"
                            alt="Nippon Kempo Match and Dashboard"
                            width={1200}
                            height={675}
                            className="w-full h-auto object-cover opacity-90"
                            priority
                        />
                    </div>
                    {/* Glow effect behind the image */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-lp-primary to-lp-accent opacity-20 blur-3xl -z-10 rounded-[3rem]"></div>
                </motion.div>
            </motion.div>
        </section>
    );
}
