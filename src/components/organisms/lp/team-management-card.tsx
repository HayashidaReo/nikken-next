"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Image from "next/image";

interface TeamManagementCardProps {
    onImageClick: (src: string, alt: string) => void;
}

export function TeamManagementCard({ onImageClick }: TeamManagementCardProps) {
    return (
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
                        onClick={() => onImageClick("/about/team_form.png", "Team Application Form")}
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
                        onClick={() => onImageClick("/about/team_management.png", "Team Management Dashboard")}
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
    );
}
