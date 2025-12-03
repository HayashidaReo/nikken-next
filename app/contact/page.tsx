import { ModernNavbar } from "@/components/organisms/lp/modern-navbar";
import { ModernFooter } from "@/components/organisms/lp/modern-footer";
import { MagneticButton } from "@/components/atoms/magnetic-button";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 flex flex-col">
            <ModernNavbar />
            <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-20 px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Us</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-8">
                        ご質問やご要望がございましたら、<br />お気軽にお問い合わせください。
                    </p>
                </div>

                <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-300">お名前</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white"
                                    placeholder="山田 太郎"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-300">メールアドレス</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white"
                                    placeholder="taro@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-medium text-gray-300">件名</label>
                            <input
                                type="text"
                                id="subject"
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white"
                                placeholder="お問い合わせ内容の概要"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-gray-300">お問い合わせ内容</label>
                            <textarea
                                id="message"
                                rows={6}
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white resize-none"
                                placeholder="詳細をご記入ください..."
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <MagneticButton>
                                <button type="button" className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
                                    <Send className="w-4 h-4" />
                                    送信する
                                </button>
                            </MagneticButton>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-8 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>support@nikken-next.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>通常24時間以内に返信いたします</span>
                        </div>
                    </div>
                </div>
            </main>
            <ModernFooter />
        </div>
    );
}
