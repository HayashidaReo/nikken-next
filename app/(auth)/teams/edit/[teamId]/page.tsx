"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { TeamEditForm } from "@/components/organisms/team-edit-form";
import { mockTeams } from "@/lib/mock-data";
import { useToast } from "@/components/providers/notification-provider";


export default function TeamEditPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { showSuccess } = useToast();

  // 該当するチームを取得
  const team = mockTeams.find(t => t.teamId === teamId);

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            チームが見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            指定されたチームは存在しないか、削除されている可能性があります。
          </p>
          <button
            onClick={() => router.push("/teams")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            チーム一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (data: { teamName: string; representativeName: string; representativePhone: string; representativeEmail: string; isApproved: boolean; remarks: string; players: { playerId: string; lastName: string; firstName: string; displayName: string; }[]; }) => {
    // TODO: 実際のAPIコールでFirestoreに保存
    console.log("チーム情報を保存:", data);

    // 保存完了のメッセージ
    showSuccess(`「${data.teamName}」の情報を更新しました`);

    // チーム一覧に戻る
    router.push("/teams");
  };

  const handleCancel = () => {
    router.push("/teams");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <TeamEditForm
        team={team}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}