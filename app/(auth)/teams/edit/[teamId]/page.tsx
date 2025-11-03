"use client";

import { useParams, useRouter, notFound } from "next/navigation";
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
    notFound();
  }

  const handleSave = async (data: {
    teamName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    isApproved: boolean;
    remarks: string;
    players: {
      playerId: string;
      lastName: string;
      firstName: string;
      displayName: string;
    }[];
  }) => {
    // TODO: 実際のAPIコールでFirestoreに保存

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
      <TeamEditForm team={team} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
