import { buttonVariants } from "@/components/atoms/button";
import { CheckCircle, Mail, Phone, ArrowRight } from "lucide-react";
import { CloseTabButton } from "@/components/molecules/close-tab-button";
import { cn } from "@/lib/utils/utils";

interface TeamsFormCompletePageProps {
  params: Promise<{
    orgId: string;
    tournamentId: string;
  }>;
}

export default async function TeamsFormCompletePage({
  params,
}: TeamsFormCompletePageProps) {
  const { orgId, tournamentId } = await params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              申請が完了しました
            </h1>

            <p className="text-gray-500 leading-relaxed mb-8">
              選手登録の申請を受け付けました。<br />
              運営担当者による承認をお待ちください。
            </p>

            <div className="space-y-3">
              <a
                href={`/teams-form/${orgId}/${tournamentId}`}
                data-no-hover="false"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 gap-2"
                )}
              >
                続けて登録する
                <ArrowRight className="w-4 h-4" />
              </a>

              <CloseTabButton />
            </div>
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  メール送信について
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed pl-6">
                  登録完了メールが届かない場合は、迷惑メールフォルダをご確認ください。
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  お問い合わせ
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed pl-6">
                  ご不明な点がございましたら、運営担当者までお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          このページを閉じても構いません
        </p>
      </div>
    </div>
  );
}
