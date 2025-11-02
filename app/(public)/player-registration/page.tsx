"use client";

import { PlayerRegistrationForm } from "@/components/organisms/player-registration-form";
import { useRegisterTeam } from "@/queries/use-teams";
import type { PlayerRegistrationData } from "@/types/player-registration.schema";

export default function PlayerRegistrationPage() {
  const registerTeamMutation = useRegisterTeam();

  const handleSubmit = async (formData: PlayerRegistrationData) => {
    return await registerTeamMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <PlayerRegistrationForm onSubmit={handleSubmit} />
    </div>
  );
}
