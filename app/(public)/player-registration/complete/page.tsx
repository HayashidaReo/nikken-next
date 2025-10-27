import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { CheckCircle, Mail, Phone } from "lucide-react";

export default function PlayerRegistrationCompletePage() {
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
                選手登録の申請を受け付けました。
                入力内容をメールに送信しましたのでご確認ください。
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
                変更やご不明点がございましたら、運営担当者までご連絡ください。
              </p>
              <div className="text-sm">
                <p className="font-medium">運営担当者: 山田 太郎</p>
                <p>メール: tournament-admin@example.com</p>
                <p>電話: 03-1234-5678</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">
                ご注意事項
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• このメールは送信専用です。返信いただいてもお答えできません。</li>
                <li>• 申請内容の承認は運営側で行います。承認結果は別途ご連絡いたします。</li>
                <li>• 大会に関する詳細情報は、後日メールまたは電話でご案内いたします。</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                ご登録いただきありがとうございました。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}