"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { ScoreboardOperator } from "@/components/organisms/scoreboard-operator";
import { useMonitorStore } from "@/store/use-monitor-store";
import { mockMatches, mockTournament } from "@/lib/mock-data";

export default function MonitorControlPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { initializeMatch } = useMonitorStore();
  
  React.useEffect(() => {
    // モックデータから該当する試合を取得
    const match = mockMatches.find(m => m.matchId === matchId);
    if (match) {
      // コート名を取得（mockTournament.courtsから）
      const court = mockTournament.courts.find(c => c.courtId === match.courtId);
      const courtName = court ? court.courtName : match.courtId;
      
      initializeMatch(match, mockTournament.tournamentName, courtName);
    }
  }, [matchId, initializeMatch]);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              試合一覧に戻る
            </Button>
          </Link>
        </div>
        
        <ScoreboardOperator />
      </div>
    </div>
  );
}