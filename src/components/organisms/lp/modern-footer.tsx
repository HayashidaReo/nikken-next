"use client";

import Link from "next/link";

export function ModernFooter() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 py-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-lg">N</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">Nikken Next</span>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
                        <Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link>
                    </div>

                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} Nikken Next.
                    </p>
                </div>
            </div>
        </footer>
    );
}
