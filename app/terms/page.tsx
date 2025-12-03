import { ModernNavbar } from "@/components/organisms/lp/modern-navbar";
import { ModernFooter } from "@/components/organisms/lp/modern-footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-blue-500/30 flex flex-col">
            <ModernNavbar />
            <main className="flex-grow pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-bold mb-12 text-center">利用規約</h1>

                    <div className="space-y-12 text-gray-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">1. 規約の適用</h2>
                            <p>
                                本利用規約（以下「本規約」といいます。）は、Nikken Next（以下「当社」といいます。）が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。本サービスを利用するすべてのユーザーは、本規約に従って本サービスを利用するものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">2. 利用登録</h2>
                            <p>
                                本サービスの利用を希望する者は、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">3. 禁止事項</h2>
                            <p>
                                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>法令または公序良俗に違反する行為</li>
                                <li>犯罪行為に関連する行為</li>
                                <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                <li>本サービスの運営を妨害するおそれのある行為</li>
                                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">4. 本サービスの提供の停止等</h2>
                            <p>
                                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">5. 免責事項</h2>
                            <p>
                                当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4">6. 準拠法・裁判管轄</h2>
                            <p>
                                本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <ModernFooter />
        </div>
    );
}
