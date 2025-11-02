import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";
import { CheckCircle, Mail, Phone } from "lucide-react";

interface TeamsFormCompletePageProps {
    params: Promise<{
        orgId: string;
        tournamentId: string;
    }>;
}

export default async function TeamsFormCompletePage({ }: TeamsFormCompletePageProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="w-full max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-600">
                            登録申請が完了しました
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center text-gray-600">
                            <p className="mb-4">
                                選手登録の申請をFirestoreに保存しました。
                                運営担当者による承認をお待ちください。
                            </p>
                            <p className="text-sm text-gray-500">
                                承認状況は管理画面で確認できます。
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                メール送信について
                            </h3>
                            <p className="text-sm text-blue-800">
                                登録完了メールが届かない場合は、迷惑メールフォルダをご確認ください。
                                それでも届かない場合は、運営担当者までお問い合わせください。
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                お問い合わせ先
                            </h3>
                            <p className="text-sm text-gray-700 mb-2">
                                ご質問やお困りの際は、以下までお問い合わせください：
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• 電話: 090-XXXX-XXXX（平日 9:00-17:00）</li>
                                <li>• メール: info@nihon-kempo.example.com</li>
                            </ul>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500">
                                このページを閉じても構いません。
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}