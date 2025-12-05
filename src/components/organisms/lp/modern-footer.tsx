"use client";

import Link from "next/link";

import Image from "next/image";

export function ModernFooter() {
    return (
        <footer className="bg-lp-bg border-t border-lp-primary/10 py-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center relative">
                            <Image src="/icon.svg" alt="MatcHub Logo" fill className="object-contain p-1" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-lp-text">MatcHub</span>
                    </div>

                    <div className="flex gap-8 text-sm text-lp-text-muted">
                        <Link href="/privacy" className="hover:text-lp-primary transition-colors">プライバシーポリシー</Link>
                        <Link href="/terms" className="hover:text-lp-primary transition-colors">利用規約</Link>
                    </div>

                    <p className="text-sm text-lp-text-muted/60">
                        © {new Date().getFullYear()} MatcHub.
                    </p>
                </div>
            </div>
        </footer>
    );
}
