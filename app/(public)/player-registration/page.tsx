"use client";

import { PlayerRegistrationForm } from "@/components/organisms/player-registration-form";

export default function PlayerRegistrationPage() {
  const handleSubmit = async (data: {
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    teamName: string;
    players: { fullName: string; }[];
    remarks: string;
  }) => {
    // TODO: 実際のAPIコールでFirestoreに保存
    console.log("選手登録データ:", data);

    // モックとして少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <PlayerRegistrationForm onSubmit={handleSubmit} />
    </div>
  );
}