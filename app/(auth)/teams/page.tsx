"use client";

import * as React from "react";
import { MainLayout } from "@/components/templates/main-layout";
import { TeamManagementCardList } from "@/components/organisms/team-management-card-list";
import { mockTeams, mockTournament } from "@/lib/mock-data";

export default function TeamsPage() {
  const [teams, setTeams] = React.useState(mockTeams);

  const handleApprovalChange = (teamId: string, isApproved: boolean) => {
    setTeams(prev =>
      prev.map(team =>
        team.teamId === teamId
          ? { ...team, isApproved, updatedAt: new Date() }
          : team
      )
    );
  };

  return (
    <MainLayout
      activeTab="teams"
      tournamentName={mockTournament.tournamentName}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">チーム・選手管理</h1>
          <div className="text-sm text-gray-600">
            総申請数: {teams.length}件 | 承認済み:{" "}
            {teams.filter(t => t.isApproved).length}件 | 未承認:{" "}
            {teams.filter(t => !t.isApproved).length}件
          </div>
        </div>

        <TeamManagementCardList
          teams={teams}
          onApprovalChange={handleApprovalChange}
        />
      </div>
    </MainLayout>
  );
}
