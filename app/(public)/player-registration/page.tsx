"use client";

import { PlayerRegistrationForm } from "@/components/organisms/player-registration-form";
import { useCreateTeam } from "@/queries";
import { PlayerRegistrationConverter } from "@/lib/converters/player-registration-converter";
import type { PlayerRegistrationData } from "@/components/molecules/confirmation-dialog";

export default function PlayerRegistrationPage() {
  const createTeamMutation = useCreateTeam();

  const handleSubmit = async (formData: PlayerRegistrationData) => {
    // フォームデータの検証
    const validation = PlayerRegistrationConverter.validateFormData(formData);
    if (!validation.isValid) {
      throw new Error(`入力データに問題があります: ${validation.errors.join(", ")}`);
    }

    // PlayerRegistrationData を TeamCreate に変換
    const teamCreate = PlayerRegistrationConverter.toTeamCreate(formData);

    // Firestoreに保存
    await createTeamMutation.mutateAsync(teamCreate);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <PlayerRegistrationForm onSubmit={handleSubmit} />
    </div>
  );
}
