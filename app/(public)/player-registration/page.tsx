"use client";

import { PlayerRegistrationForm } from "@/components/organisms/player-registration-form";
import type { PlayerRegistrationData } from "@/components/molecules/confirmation-dialog";

export default function PlayerRegistrationPage() {
  const handleSubmit = async (formData: PlayerRegistrationData) => {
    // API Route経由でサーバーサイドに保存
    const response = await fetch("/api/teams/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || "チーム登録に失敗しました"
      );
    }

    const result = await response.json();
    console.log("登録成功:", result);

    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <PlayerRegistrationForm onSubmit={handleSubmit} />
    </div>
  );
}
