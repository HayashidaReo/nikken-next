"use client";

import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/atoms/select";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useTournamentsByOrganization } from "@/queries/use-tournaments";
import { useAuthStore } from "@/store/use-auth-store";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { TournamentSelectDropdown } from "@/components/atoms/tournament-select-dropdown";

interface TournamentSelectorProps {
  className?: string;
  onManageClick?: () => void;
}

/**
 * ヘッダー用の大会選択ドロップダウンコンポーネント
 * Molecules層：Selectコンポーネント(Atom)を組み合わせた機能単位
 */
export function HeaderTournamentSelector({
  className,
  onManageClick,
}: TournamentSelectorProps) {
  const { user } = useAuthStore();
  const { activeTournamentId, setActiveTournament } = useActiveTournament();

  // ユーザーのUIDを組織IDとして使用（大会設定画面と同じ実装）
  const orgId = user?.uid || null;

  const {
    data: tournaments = [],
    isLoading,
    error,
  } = useTournamentsByOrganization(orgId);

  const handleTournamentChange = (value: string) => {
    if (value === "manage") {
      onManageClick?.();
      return;
    }
    setActiveTournament(value);
  };

  if (!user) {
    return null; // 未ログイン時は表示しない
  }

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        大会一覧の取得に失敗しました
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
  {/* Header 用 大会選択ドロップダウン（大会管理メニュー付き） */}
      <Select
        value={activeTournamentId || ""}
        onValueChange={handleTournamentChange}
        disabled={isLoading}
      >
        <TournamentSelectDropdown
          tournaments={tournaments}
          selectedId={activeTournamentId || undefined}
          onSelect={handleTournamentChange}
          isLoading={isLoading}
          isError={!!error}
          placeholder="大会を選択"
          showSelectedDetails={true}
          triggerClassName="border-none bg-transparent hover:bg-gray-100 transition-colors min-w-[320px] h-auto shadow-none focus:ring-0 focus:ring-offset-0 py-2 px-3"
          contentMinWidth="min-w-[280px]"
        />

        {/* 大会管理メニュー */}
        {tournaments.length > 0 && (
          <SelectContent className="min-w-[280px] border-none shadow-lg">
            <div className="bg-gray-50 mt-1 pt-1 pb-0.5">
              <SelectItem
                value="manage"
                className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 cursor-pointer rounded-md"
              >
                <div className="flex items-center space-x-2 py-1.5">
                  <Settings className="h-4 w-4" />
                  <span className="font-medium">大会を管理</span>
                </div>
              </SelectItem>
            </div>
          </SelectContent>
        )}
      </Select>
    </div>
  );
}
