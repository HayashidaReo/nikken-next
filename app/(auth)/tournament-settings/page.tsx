"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TournamentSettingsForm } from "@/components/organisms/tournament-settings-form";
import { TournamentList } from "@/components/organisms/tournament-list";
import { useCreateTournament, useUpdateTournament } from "@/queries/use-tournaments";
import { useToast } from "@/components/providers/notification-provider";
import type { Tournament, TournamentCreate } from "@/types/tournament.schema";

export default function TournamentSettingsPage() {
  const { showSuccess, showError } = useToast();
  const { mutate: createTournament } = useCreateTournament();
  const { mutate: updateTournament } = useUpdateTournament();

  const [selectedTournament, setSelectedTournament] = React.useState<Tournament | null>(null);
  const [isNewTournament, setIsNewTournament] = React.useState(false);

  const handleTournamentSelect = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsNewTournament(false);
  };

  const handleNewTournament = () => {
    setSelectedTournament(null);
    setIsNewTournament(true);
  };

  const handleSave = async (data: {
    tournamentName: string;
    tournamentDate: string;
    location: string;
    defaultMatchTime: number;
    courts: { courtId: string; courtName: string }[];
  }) => {
    if (isNewTournament) {
      // 新規作成
      const newTournament: TournamentCreate = {
        tournamentName: data.tournamentName,
        tournamentDate: data.tournamentDate,
        location: data.location,
        defaultMatchTime: data.defaultMatchTime,
        courts: data.courts,
      };

      createTournament(newTournament, {
        onSuccess: (createdTournament) => {
          showSuccess(`「${data.tournamentName}」を作成しました`);
          setSelectedTournament(createdTournament);
          setIsNewTournament(false);
        },
        onError: (error) => {
          showError(`大会の作成に失敗しました: ${error.message}`);
        },
      });
    } else if (selectedTournament) {
      // 既存の大会を更新
      updateTournament(
        {
          tournamentId: selectedTournament.tournamentId!,
          patch: {
            tournamentName: data.tournamentName,
            tournamentDate: data.tournamentDate,
            location: data.location,
            defaultMatchTime: data.defaultMatchTime,
            courts: data.courts,
          },
        },
        {
          onSuccess: (updatedTournament) => {
            showSuccess(`「${data.tournamentName}」を更新しました`);
            setSelectedTournament(updatedTournament);
          },
          onError: (error) => {
            showError(`大会の更新に失敗しました: ${error.message}`);
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: 大会一覧 */}
          <div className="lg:col-span-1">
            <TournamentList
              selectedTournamentId={selectedTournament?.tournamentId || null}
              onTournamentSelect={handleTournamentSelect}
              onNewTournament={handleNewTournament}
            />
          </div>

          {/* 右側: 大会詳細フォーム */}
          <div className="lg:col-span-2">
            {selectedTournament || isNewTournament ? (
              <TournamentSettingsForm
                tournament={selectedTournament}
                onSave={handleSave}
                isNewTournament={isNewTournament}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">大会を選択してください</p>
                  <p className="text-sm">左の一覧から編集する大会を選ぶか、新しい大会を作成してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
