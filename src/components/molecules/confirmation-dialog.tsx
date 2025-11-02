"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { CheckCircle } from "lucide-react";
import { DialogOverlay } from "./dialog-overlay";

// 姓名を分割するユーティリティ関数
function splitFullName(fullName: string): { lastName: string; firstName: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length >= 2) {
    return {
      lastName: parts[0],
      firstName: parts.slice(1).join(' '), // 複数の名前の部分を結合
    };
  }

  // スペースがない場合のフォールバック
  return {
    lastName: trimmed,
    firstName: '',
  };
}

export interface PlayerRegistrationData {
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  teamName: string;
  players: { fullName: string }[];
  remarks: string;
}

interface ConfirmationDialogProps {
  data: PlayerRegistrationData;
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">登録内容の確認</h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">代表者情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">代表者名</p>
                  <p className="font-medium">{data.representativeName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">電話番号</p>
                  <p className="font-medium">{data.representativePhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    メールアドレス
                  </p>
                  <p className="font-medium">{data.representativeEmail}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">チーム情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    チーム名（所属名）
                  </p>
                  <p className="font-medium">{data.teamName}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  選手一覧 ({data.players.length}名)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.players.map((player, index) => {
                    const { lastName, firstName } = splitFullName(player.fullName);
                    return (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-600">姓</p>
                            <p className="font-medium">{lastName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">名</p>
                            <p className="font-medium">{firstName || '（未入力）'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {data.remarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">備考</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{data.remarks}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-4 mt-8 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-24"
            >
              戻る
            </Button>
            <Button type="button" onClick={onConfirm} className="w-32">
              登録確定
            </Button>
          </div>
        </div>
      </div>
    </DialogOverlay>
  );
}
