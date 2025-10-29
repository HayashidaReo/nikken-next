"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { TimePicker } from "@/components/molecules/time-picker";
import { CourtManager } from "@/components/molecules/court-manager";
import { useToast } from "@/components/providers/notification-provider";
import { useOrganizationId } from "@/hooks/useTournament";
import {
  useTournamentsByOrganization,
  useCreateOrganization,
  useCreateTournament,
  useUpdateTournamentByOrganization
} from "@/queries/use-tournaments";
import { AuthGuardWrapper } from "@/components/templates/auth-guard-wrapper";
import { AuthenticatedHeader } from "@/components/organisms/authenticated-header";
import type { Tournament } from "@/types/tournament.schema";

interface TournamentWithId extends Tournament {
  tournamentId: string;
}

export default function TournamentSettingsPage() {
  const { showSuccess, showError } = useToast();
  const { orgId } = useOrganizationId();

  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  const { mutate: createOrganization, isPending: isCreatingOrg } = useCreateOrganization();
  const { mutate: createTournament } = useCreateTournament();
  const { mutate: updateTournament } = useUpdateTournamentByOrganization();

  // 状態管理
  const [selectedTournamentId, setSelectedTournamentId] = React.useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [formData, setFormData] = React.useState<Tournament>({
    tournamentName: "",
    tournamentDate: "",
    location: "",
    defaultMatchTime: 180, // 3分 = 180秒
    courts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 選択されている大会
  const selectedTournament = selectedTournamentId
    ? tournaments.find((t: TournamentWithId) => t.tournamentId === selectedTournamentId)
    : null;

  // showErrorを安定化
  const stableShowError = React.useCallback((message: string) => {
    showError(message);
  }, [showError]);

  // 組織作成ハンドラー
  const handleCreateOrganization = React.useCallback(async () => {
    createOrganization(undefined, {
      onSuccess: (result) => {
        showSuccess(`組織が作成されました: ${result.orgId}`);
      },
      onError: (error) => {
        stableShowError(error instanceof Error ? error.message : "組織作成に失敗しました");
      }
    });
  }, [createOrganization, showSuccess, stableShowError]);

  // React Queryで自動的にデータフェッチが行われるため、手動のuseEffectは不要

  // 大会選択ハンドラー
  const handleSelectTournament = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setIsAddingNew(false);

    const tournament = tournaments.find((t: TournamentWithId) => t.tournamentId === tournamentId);
    if (tournament) {
      setFormData({
        tournamentName: tournament.tournamentName,
        tournamentDate: tournament.tournamentDate,
        location: tournament.location,
        defaultMatchTime: tournament.defaultMatchTime,
        courts: tournament.courts || [],
        createdAt: new Date(tournament.createdAt),
        updatedAt: new Date(tournament.updatedAt),
      });
    }
  };

  // 新規大会追加ハンドラー
  const handleAddNewTournament = () => {
    setSelectedTournamentId(null);
    setIsAddingNew(true);
    setFormData({
      tournamentName: "",
      tournamentDate: "",
      location: "",
      defaultMatchTime: 180,
      courts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  // フォーム保存ハンドラー
  const handleSave = async () => {
    if (!orgId) {
      showError("組織IDが設定されていません");
      return;
    }

    console.log("バリデーション確認:", {
      tournamentName: formData.tournamentName,
      trimmed: formData.tournamentName.trim(),
      length: formData.tournamentName.trim().length,
      isEmpty: !formData.tournamentName.trim()
    });

    if (!formData.tournamentName.trim()) {
      showError("大会名を入力してください");
      return;
    }

    try {
      if (isAddingNew) {
        // 新規作成
        const tournamentData = {
          tournamentName: formData.tournamentName,
          tournamentDate: formData.tournamentDate,
          location: formData.location,
          defaultMatchTime: formData.defaultMatchTime,
          courts: formData.courts
        };
        console.log("API呼び出しデータ:", { orgId, tournamentData });
        createTournament(
          { orgId, tournamentData },
          {
            onSuccess: (result) => {
              console.log("API成功レスポンス:", result);
              showSuccess("大会を作成しました");
              setIsAddingNew(false);
              setSelectedTournamentId(result.data.tournamentId);
              // 作成された大会のデータでフォームを更新
              setFormData(prev => ({
                ...prev,
                ...result.data
              }));
            },
            onError: (error) => {
              console.error("API エラー詳細:", error);
              showError(error instanceof Error ? error.message : "大会の作成に失敗しました");
            }
          }
        );
      } else if (selectedTournamentId) {
        // 更新
        updateTournament(
          { orgId, tournamentId: selectedTournamentId, patch: formData },
          {
            onSuccess: () => {
              showSuccess("大会設定を更新しました");
            },
            onError: (error) => {
              showError(error instanceof Error ? error.message : "保存に失敗しました");
            }
          }
        );
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "保存に失敗しました");
    }
  };

  // フォームフィールド更新ハンドラー
  const handleFormChange = (field: keyof Tournament, value: string | number | Date | { courtId: string; courtName: string }[]) => {
    console.log("フォーム更新:", { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 組織IDが設定されていない場合
  if (!orgId) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                大会を設定するには、まず組織を選択してください。
              </p>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">大会情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  // エラー表示
  if (error) {
    return (
      <AuthGuardWrapper>
        <div className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <AuthenticatedHeader title="大会設定" />
            <div className="mt-8 text-center">
              <p className="text-red-600 mb-4">{error?.message || String(error)}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  再読み込み
                </Button>
                {String(error).includes("組織が見つかりません") && (
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={isCreatingOrg}
                    variant="outline"
                  >
                    {isCreatingOrg ? "作成中..." : "🏢 組織を作成"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthGuardWrapper>
    );
  }

  return (
    <AuthGuardWrapper>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
          </div>

          <AuthenticatedHeader
            title="大会設定"
            subtitle="大会の編集・新規追加・削除を行う管理画面"
          />

          <div className="mt-8 flex gap-8">
            {/* 左側: 大会一覧エリア */}
            <div className="w-1/3">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">大会一覧</h3>

                {/* 新規追加ボタン */}
                <Button
                  onClick={handleAddNewTournament}
                  className="w-full mb-4"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新しい大会を追加
                </Button>

                {/* 大会リスト */}
                <div className="space-y-2">
                  {tournaments.map((tournament: TournamentWithId) => (
                    <button
                      key={tournament.tournamentId}
                      onClick={() => tournament.tournamentId && handleSelectTournament(tournament.tournamentId)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${selectedTournamentId === tournament.tournamentId
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      <div className="font-medium">
                        {tournament.tournamentName || "未設定の大会"}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {tournament.tournamentDate || "開催日未定"}
                      </div>
                    </button>
                  ))}

                  {tournaments.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>大会がありません</p>
                      <p className="text-sm">新しい大会を追加してください</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側: 大会詳細フォーム */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {isAddingNew ? "新規大会作成" : selectedTournament ? "大会編集" : "大会を選択してください"}
                  </h3>
                  {(selectedTournament || isAddingNew) && (
                    <Button onClick={handleSave}>
                      保存
                    </Button>
                  )}
                </div>

                {(selectedTournament || isAddingNew) ? (
                  <div className="space-y-6">
                    {/* 大会名 */}
                    <div>
                      <Label htmlFor="tournamentName">大会名</Label>
                      <Input
                        id="tournamentName"
                        value={formData.tournamentName}
                        onChange={(e) => handleFormChange("tournamentName", e.target.value)}
                        placeholder="大会名を入力してください"
                        className="mt-1"
                      />
                    </div>

                    {/* 開催日 */}
                    <div>
                      <Label htmlFor="tournamentDate">開催日</Label>
                      <Input
                        id="tournamentDate"
                        value={formData.tournamentDate}
                        onChange={(e) => handleFormChange("tournamentDate", e.target.value)}
                        placeholder="例: 2024年3月15日"
                        className="mt-1"
                      />
                    </div>

                    {/* 開催場所 */}
                    <div>
                      <Label htmlFor="location">開催場所</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleFormChange("location", e.target.value)}
                        placeholder="開催場所を入力してください"
                        className="mt-1"
                      />
                    </div>

                    {/* デフォルト試合時間 */}
                    <TimePicker
                      label="デフォルト試合時間"
                      value={formData.defaultMatchTime}
                      onChange={(seconds) => handleFormChange("defaultMatchTime", seconds)}
                    />

                    {/* コート情報 */}
                    <CourtManager
                      courts={formData.courts}
                      onChange={(courts) => handleFormChange("courts", courts)}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <p className="text-lg">左側から大会を選択するか、新しい大会を追加してください</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuardWrapper>
  );
}