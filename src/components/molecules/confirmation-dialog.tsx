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
import { InfoCard } from "./info-card";
import type { TeamFormData } from "@/types/team-form.schema";
import PlayerName from "./player-name";

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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">登録内容の確認</h2>
          </div>

          <div className="space-y-6">
            <InfoCard title="代表者情報">
              <div className="space-y-4">
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
              </div>
            </InfoCard>

            <InfoCard title="チーム情報">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  チーム名（所属名）
                </p>
                <p className="font-medium">{data.teamName}</p>
              </div>
            </InfoCard>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  選手一覧 ({data.players.length}名)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.players.map((player, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <PlayerName fullName={player.fullName} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {data.remarks && (
              <InfoCard title="備考">
                <p className="whitespace-pre-wrap">{data.remarks}</p>
              </InfoCard>
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
