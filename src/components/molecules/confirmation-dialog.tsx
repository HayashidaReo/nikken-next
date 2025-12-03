"use client";

import { Button } from "@/components/atoms/button";
import { CheckCircle } from "lucide-react";
import { DialogOverlay } from "./dialog-overlay";
import type { TeamFormData } from "@/types/team-form.schema";

interface ConfirmationDialogProps {
  data: TeamFormData;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export function ConfirmationDialog({
  data,
  onConfirm,
  onCancel,
  isVisible,
}: ConfirmationDialogProps) {
  if (!isVisible) return null;

  return (
    <DialogOverlay isOpen={isVisible} onClose={onCancel} className="p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-6">
            <div className="bg-blue-50 p-2 rounded-full">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">申請内容の確認</h2>
          </div>

          <div className="space-y-10">
            {/* 代表者情報 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">代表者情報</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">代表者名</p>
                  <p className="font-medium text-gray-900">{data.representativeName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">電話番号</p>
                  <p className="font-medium text-gray-900">{data.representativePhone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">メールアドレス</p>
                  <p className="font-medium text-gray-900">{data.representativeEmail}</p>
                </div>
              </div>
            </section>

            {/* チーム情報 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">チーム情報</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">チーム名（団体名）</p>
                <p className="font-medium text-gray-900">{data.teamName}</p>
              </div>
            </section>

            {/* 選手一覧 */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-5 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">
                  選手一覧 <span className="text-sm font-normal text-gray-500 ml-2">({data.players.length}名)</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.players.map((player, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full text-xs font-medium text-gray-400 border border-gray-200">
                      {index + 1}
                    </div>
                    <p className="font-medium text-gray-900">
                      {player.fullName}
                      {player.grade && (
                        <span className="ml-2 text-sm text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded">
                          {player.grade}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 備考 */}
            {data.remarks && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-1 bg-blue-600 rounded-full" />
                  <h3 className="text-lg font-semibold text-gray-900">備考欄</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{data.remarks}</p>
                </div>
              </section>
            )}
          </div>

          <div className="flex gap-4 mt-10 pt-6 border-t border-gray-100 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6 h-11"
            >
              戻る
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="px-8 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              送信する
            </Button>
          </div>
        </div>
      </div>
    </DialogOverlay>
  );
}
