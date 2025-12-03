import { ModernNavbar } from "@/components/organisms/lp/modern-navbar";
import { ModernFooter } from "@/components/organisms/lp/modern-footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 flex flex-col">
            <ModernNavbar />
            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center">プライバシーポリシー</h1>

                    <div className="space-y-12 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. 個人情報の収集について</h2>
                            <p>
                                当社は、本サービスの提供にあたり、ユーザーの皆様から必要最小限の個人情報を収集することがあります。収集する情報には、氏名、メールアドレス、所属団体名などが含まれますが、これらに限定されません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. 個人情報の利用目的</h2>
                            <p>
                                収集した個人情報は、以下の目的のために利用いたします。
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>本サービスの提供および運営のため</li>
                                <li>ユーザーへのお知らせや連絡のため</li>
                                <li>お問い合わせへの対応のため</li>
                                <li>サービスの改善および新機能の開発のため</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. 個人情報の第三者提供</h2>
                            <p>
                                当社は、法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供することはありません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. 個人情報の安全管理</h2>
                            <p>
                                当社は、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. プライバシーポリシーの変更</h2>
                            <p>
                                当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. お問い合わせ窓口</h2>
                            <p>
                                本ポリシーに関するお問い合わせは、お問い合わせフォームよりお願いいたします。
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <ModernFooter />
        </div>
    );
}
