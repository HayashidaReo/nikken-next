"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TournamentSettingsForm } from "@/components/organisms/tournament-settings-form";
import { mockTournament } from "@/lib/mock-data";

export default function TournamentSettingsPage() {
  const router = useRouter();

  const handleSave = async (data: { tournamentName: string; tournamentDate: string; location: string; defaultMatchTime: number; courts: { courtId: string; courtName: string; }[]; }) => {
    // TODO: 実際のAPIコールでFirestoreに保存
    console.log("大会設定を保存:", data);
    
    // 保存完了のメッセージ
    alert("大会設定を保存しました");
    
    // 前の画面に戻る
    router.back();
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
        
        <TournamentSettingsForm
          tournament={mockTournament}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}