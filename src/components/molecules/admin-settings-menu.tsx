"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import { useRouter } from "next/navigation";
import { APP_INFO, ROUTES, AUTH_CONSTANTS } from "@/lib/constants";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface AdminSettingsMenuProps {
    className?: string;
}

export function AdminSettingsMenu({ className }: AdminSettingsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { signOut, user } = useAuthStore();
    const router = useRouter();
    const confirmDialog = useConfirmDialog();

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

    const handleLogoutClick = () => {
        setIsOpen(false);
        confirmDialog.openDialog({
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

    const renderMenuButton = (
        onClick: () => void,
        Icon: React.ElementType,
        label: React.ReactNode,
        options: {
            isDestructive?: boolean;
        } = {}
    ) => {
        const { isDestructive = false } = options;

        return (
            <button
                onClick={onClick}
                className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                    isDestructive ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                )}
            >
                {Icon && <Icon className={cn("w-4 h-4", isDestructive ? "text-red-600" : "text-gray-600")} />}
                <span>{label}</span>
            </button>
        );
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
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </div>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                        {user && (
                            <>
                                <div className="px-4 py-2 flex items-center gap-3 text-sm text-gray-700 bg-gray-50/50">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs text-muted-foreground font-medium">Logged in as</span>
                                        <span className="font-medium truncate" title={user.email || ""}>
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 my-1" />
                            </>
                        )}

                        {renderMenuButton(
                            handleLogoutClick,
                            LogOut,
                            "ログアウト",
                            { isDestructive: true }
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        <div className="px-4 py-2 text-center text-xs text-gray-400">
                            v{APP_INFO.VERSION}
                        </div>
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
                onCancel={confirmDialog.closeDialog}
                variant={confirmDialog.variant}
            />
        </>
    );
}
