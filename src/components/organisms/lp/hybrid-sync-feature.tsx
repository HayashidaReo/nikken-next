"use client";

import { motion } from "framer-motion";
import { WifiOff, Cloud, RefreshCw } from "lucide-react";

export function HybridSyncFeature() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors md:col-span-2 h-full min-h-[300px]"
        >
            <div className="absolute inset-0 flex">
                {/* Offline Side */}
                <div className="w-1/2 h-full p-8 flex flex-col justify-between relative z-10 border-r border-white/5 bg-gradient-to-br from-blue-900/10 to-transparent">
                    <div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                            <WifiOff className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">オフライン<br />ファースト</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            ネット環境がなくても<br />
                            アプリは止まりません。<br />
                            ローカルで完璧に動作。
                        </p>
                    </div>
                </div>

                {/* Realtime Side */}
                <div className="w-1/2 h-full p-8 flex flex-col justify-between relative z-10 bg-gradient-to-tl from-purple-900/10 to-transparent">
                    <div className="items-end text-right flex flex-col">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">リアルタイム<br />同期</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            オンライン復帰時に<br />
                            瞬時にデータを同期。<br />
                            全デバイスで最新状態へ。
                        </p>
                    </div>
                </div>
            </div>

            {/* Center Connector */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-xl">
                    <RefreshCw className="w-5 h-5 text-white/60" />
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
        </motion.div>
    );
}
