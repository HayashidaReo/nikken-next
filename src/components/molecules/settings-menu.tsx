"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, CloudDownload, CloudUpload, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { useActiveTournament } from "@/store/use-active-tournament-store";
import { useToast } from "@/components/providers/notification-provider";
import { syncService } from "@/services/sync-service";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { UnsyncedDataDialog } from "@/components/organisms/unsynced-data-dialog";
import { useRouter } from "next/navigation";
import { ROUTES, AUTH_CONSTANTS } from "@/lib/constants";
import { LocalMatch, LocalMatchGroup, LocalTeamMatch, LocalTeam } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/atoms/tooltip";

interface SettingsMenuProps {
    className?: string;
}

export function SettingsMenu({ className }: SettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, signOut } = useAuthStore();
    const { activeTournamentId } = useActiveTournament();
    const { showSuccess, showError, showInfo } = useToast();
    const router = useRouter();
    const isOnline = useOnlineStatus();

    const unsyncedCount = useLiveQuery(async () => {
        if (!user?.uid || !activeTournamentId) return 0;
        return await syncService.getUnsyncedCount(user.uid, activeTournamentId);
    }, [user?.uid, activeTournamentId]);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        variant?: "default" | "destructive";
    }>({
        isOpen: false,
        title: "",
        message: "",
        action: async () => { },
    });

    const [unsyncedData, setUnsyncedData] = useState<{
        matches: LocalMatch[];
        matchGroups: LocalMatchGroup[];
        teamMatches: LocalTeamMatch[];
        teams: LocalTeam[];
    } | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // メニュー外クリックで閉じる
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleAction = async (action: () => Promise<void>, successMessage: string) => {
        try {
            setIsLoading(true);
            await action();
            if (successMessage) showSuccess(successMessage);
        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
            setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
    };

    const handleLogout = () => {
        setIsOpen(false);
        setConfirmDialog({
            isOpen: true,
            title: "ログアウト",
            message: "ログアウトしますか？",
            variant: "destructive",
            action: async () => {
                await signOut();
                setTimeout(() => {
                    router.push(ROUTES.LOGIN);
                }, AUTH_CONSTANTS.LOGOUT_REDIRECT_DELAY);
            },
        });
    };

    const handleInitialize = () => {
        setIsOpen(false);
        setConfirmDialog({
            isOpen: true,
            title: "端末内のデータ初期化",
            message: "端末内のデータをすべて削除します。この操作は取り消せません。よろしいですか？<br>※ クラウド上のデータには影響しません。",
            variant: "destructive",
            action: async () => handleAction(async () => {
                await syncService.clearLocalData();
            }, "端末内のデータを初期化しました"),
        });
    };

    const handleFetchFromCloud = () => {
        setIsOpen(false);
        if (!user?.uid || !activeTournamentId) {
            showError("大会が選択されていません");
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: "クラウドからデータ取得",
            message: "クラウドから最新のデータを取得し、端末内のデータを上書きします。よろしいですか？",
            action: async () => handleAction(async () => {
                await syncService.downloadTournamentData(user.uid, activeTournamentId);
            }, "クラウドからデータを取得しました"),
        });
    };

    const handleSendToCloud = async () => {
        setIsOpen(false);
        if (!user?.uid || !activeTournamentId) {
            showError("大会が選択されていません");
            return;
        }

        try {
            setIsLoading(true);
            const data = await syncService.getUnsyncedData(user.uid, activeTournamentId);
            const totalCount = data.matches.length + data.matchGroups.length + data.teamMatches.length + data.teams.length;

            if (totalCount === 0) {
                showInfo("送信するデータはありませんでした");
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            setUnsyncedData(data);
        } catch (error) {
            console.error(error);
            showError("データの取得に失敗しました");
            setIsLoading(false);
        }
    };

    const confirmSendToCloud = async () => {
        if (!user?.uid || !activeTournamentId) return;

        try {
            setIsLoading(true);
            const count = await syncService.uploadResults(user.uid, activeTournamentId);
            showSuccess(`${count}件のデータを送信しました`);
        } catch (error) {
            console.error(error);
            showError(error instanceof Error ? error.message : "送信に失敗しました");
        } finally {
            setIsLoading(false);
            setUnsyncedData(null);
        }
    };

    const renderMenuButton = (
        onClick: () => void,
        icon: React.ElementType,
        label: React.ReactNode,
        options: {
            disabled?: boolean;
            isDestructive?: boolean;
            requiresOnline?: boolean;
        } = {}
    ) => {
        const { disabled = false, isDestructive = false, requiresOnline = false } = options;
        const isOfflineBlocked = requiresOnline && !isOnline;
        const isDisabled = disabled || isOfflineBlocked;

        const buttonContent = (
            <button
                onClick={onClick}
                className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                    isDestructive ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50",
                    isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                )}
                disabled={isDisabled}
            >
                {/* @ts-expect-error: Lucide icon component type compatibility */}
                {icon && <icon className={cn("w-4 h-4", isDestructive ? "text-red-600" : "text-gray-600")} />}
                <span>{label}</span>
            </button>
        );

        if (isOfflineBlocked) {
            return (
                <TooltipProvider>
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <div className="w-full">{buttonContent}</div>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>オンライン時のみ使用できます</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return buttonContent;
    };

    return (
        <>
            <div className={cn("relative", className)} ref={menuRef}>
                <div className="relative inline-block">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="設定メニュー"
                        disabled={isLoading}
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                    {unsyncedCount !== undefined && unsyncedCount > 0 && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unsyncedCount > 99 ? "99+" : unsyncedCount}
                        </span>
                    )}
                </div>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                        {renderMenuButton(
                            handleFetchFromCloud,
                            CloudDownload,
                            "クラウド同期",
                            { disabled: !activeTournamentId, requiresOnline: true }
                        )}

                        {renderMenuButton(
                            handleSendToCloud,
                            CloudUpload,
                            <>
                                クラウドにデータ送信
                                {unsyncedCount !== undefined && unsyncedCount > 0 && ` (${unsyncedCount}件)`}
                            </>,
                            { disabled: !activeTournamentId, requiresOnline: true }
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        {renderMenuButton(
                            handleInitialize,
                            Trash2,
                            "端末のデータ初期化",
                            { isDestructive: true }
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        {renderMenuButton(
                            handleLogout,
                            LogOut,
                            "ログアウト",
                            { isDestructive: true, requiresOnline: true }
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText="実行"
                cancelText="キャンセル"
                onConfirm={confirmDialog.action}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                variant={confirmDialog.variant}
            />

            {unsyncedData && (
                <UnsyncedDataDialog
                    isOpen={!!unsyncedData}
                    onClose={() => setUnsyncedData(null)}
                    onConfirm={confirmSendToCloud}
                    data={unsyncedData}
                />
            )}
        </>
    );
}
