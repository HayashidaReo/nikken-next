/**
 * 試合競合情報表示コンポーネント
 * 保存時・更新時の両ダイアログで使用される競合内容の表示ロジック
 * (UIをモダンに改修 - 黄色を削除し黒の濃淡に変更、横幅を拡張)
 */

import type { Match } from "@/types/match.schema";
// ... (imports are unchanged) ...
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Info,
    XCircle,
} from "lucide-react";

// ... (imports are unchanged) ...
import { cn } from "@/lib/utils/utils";

interface ConflictDetails {
    // ... (interface definitions are unchanged) ...
    matchId: string;
    directConflicts: {
        // ... (interface definitions are unchanged) ...
        courtId?: { draft: string; server: string };
        round?: { draft: string; server: string };
        playerA?: { draft: string; server: string };
        playerB?: { draft: string; server: string };
    };
    serverOnlyChanges: {
        // ... (interface definitions are unchanged) ...
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
    };
}

interface ConflictDetailsDisplayProps {
    // ... (interface definitions are unchanged) ...
    conflicts: ConflictDetails[];
    draftLabel?: string; // デフォルト: "あなたの編集"
    addedMatches?: Match[]; // 他端末で追加された試合
    deletedMatches?: Match[]; // 他端末で削除された試合
}

/**
 * 競合情報の詳細を表示
// ... (comments are unchanged) ...
 */
export function ConflictDetailsDisplay({
    // ... (function signature is unchanged) ...
    conflicts,
    draftLabel = "あなたの編集",
    addedMatches = [],
    deletedMatches = [],
}: ConflictDetailsDisplayProps) {
    return (
        <div className="space-y-4">
            {/* 他端末で追加された試合 */}
            {addedMatches.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-sm text-green-800 mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        他端末で追加された試合 ({addedMatches.length}件)
                    </div>
                    <div className="space-y-2 pl-7">
                        {addedMatches.map((match, idx) => (
                            <div
                                key={match.matchId || idx}
                                className="text-sm bg-white p-2.5 rounded-md shadow-xs"
                            >
                                <div>
                                    <strong>コート:</strong> {match.courtId}
                                </div>
                                <div>
                                    <strong>ラウンド:</strong> {match.round}
                                </div>
                                <div>
                                    <strong>選手A:</strong> {match.players.playerA.displayName}
                                </div>
                                <div>
                                    <strong>選手B:</strong> {match.players.playerB.displayName}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 他端末で削除された試合 */}
            {deletedMatches.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-sm text-red-800 mb-3">
                        <XCircle className="w-5 h-5" />
                        他端末で削除された試合 ({deletedMatches.length}件)
                    </div>
                    <div className="space-y-2 pl-7">
                        {deletedMatches.map((match, idx) => (
                            <div
                                key={match.matchId || idx}
                                className="text-sm bg-white p-2.5 rounded-md shadow-xs line-through opacity-70"
                            >
                                <div>
                                    <strong>コート:</strong> {match.courtId}
                                </div>
                                <div>
                                    <strong>ラウンド:</strong> {match.round}
                                </div>
                                <div>
                                    <strong>選手A:</strong> {match.players.playerA.displayName}
                                </div>
                                <div>
                                    <strong>選手B:</strong> {match.players.playerB.displayName}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 既存試合のフィールド変更 */}
            {conflicts.map((conflict, index) => {
                // ... (mapping logic is unchanged) ...
                const hasDirectConflicts =
                    Object.keys(conflict.directConflicts).length > 0;
                const hasServerOnlyChanges =
                    Object.keys(conflict.serverOnlyChanges).length > 0;

                return (
                    <div
                        // ... (card styling is unchanged) ...
                        key={conflict.matchId || index}
                        className="rounded-lg bg-white shadow-sm overflow-hidden border border-gray-200"
                    >
                        <div className="font-medium text-gray-800 p-4 border-b border-gray-100">
                            試合 #{index + 1}
                        </div>

                        <div className="px-4 py-4 space-y-4">
                            {/* 競合セクション */}
                            {hasDirectConflicts && (
                                <div className="bg-white rounded-lg p-4 border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-2 font-semibold text-sm text-red-800">
                                        <AlertTriangle className="w-5 h-5" />
                                        あなたの編集との競合
                                    </div>
                                    <div className="pl-7 mt-3 space-y-1">
                                        {/* テーブルヘッダー (横幅拡張) */}
                                        <div className="grid grid-cols-[minmax(100px,_1fr)_minmax(140px,_1.2fr)_auto_minmax(140px,_1.2fr)] gap-x-3 text-xs text-gray-500 font-medium pb-1 border-b border-red-200">
                                            <span>変更点</span>
                                            <span>{draftLabel}</span>
                                            <span /> {/* 矢印列のヘッダー */}
                                            <span className="text-red-700 font-semibold">
                                                他端末の最新 (競合)
                                            </span>
                                        </div>
                                        {/* テーブル行 */}
                                        {conflict.directConflicts.courtId && (
                                            // ... (component call is unchanged) ...
                                            <ConflictFieldDisplay
                                                fieldLabel="コート"
                                                draft={conflict.directConflicts.courtId.draft}
                                                server={conflict.directConflicts.courtId.server}
                                            />
                                        )}
                                        {conflict.directConflicts.round && (
                                            // ... (component call is unchanged) ...
                                            <ConflictFieldDisplay
                                                fieldLabel="ラウンド"
                                                draft={conflict.directConflicts.round.draft}
                                                server={conflict.directConflicts.round.server}
                                            />
                                        )}
                                        {conflict.directConflicts.playerA && (
                                            // ... (component call is unchanged) ...
                                            <ConflictFieldDisplay
                                                fieldLabel="選手A"
                                                draft={conflict.directConflicts.playerA.draft}
                                                server={conflict.directConflicts.playerA.server}
                                            />
                                        )}
                                        {conflict.directConflicts.playerB && (
                                            // ... (component call is unchanged) ...
                                            <ConflictFieldDisplay
                                                fieldLabel="選手B"
                                                draft={conflict.directConflicts.playerB.draft}
                                                server={conflict.directConflicts.playerB.server}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- 変更点 (ここから) --- */}
                            {/* 他端末変更セクション (黄色を削除) */}
                            {hasServerOnlyChanges && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                                        <Info className="w-5 h-5 text-gray-500" />
                                        他端末での変更
                                    </div>
                                    <div className="pl-7 mt-3 space-y-1">
                                        {/* テーブルヘッダー (横幅拡張・黄色削除) */}
                                        <div className="grid grid-cols-[minmax(100px,_1fr)_minmax(140px,_1.2fr)_auto_minmax(140px,_1.2fr)] gap-x-3 text-xs text-gray-500 font-medium pb-1 border-b border-gray-200">
                                            <span>変更箇所</span>
                                            <span>現在</span>
                                            <span /> {/* 矢印列のヘッダー */}
                                            <span className="text-gray-600 font-semibold">
                                                他端末の最新
                                            </span>
                                        </div>
                                        {/* テーブル行 */}
                                        {conflict.serverOnlyChanges.courtId && (
                                            <ServerOnlyChangeDisplay
                                                fieldLabel="コート"
                                                initial={conflict.serverOnlyChanges.courtId.initial}
                                                server={conflict.serverOnlyChanges.courtId.server}
                                            />
                                        )}
                                        {conflict.serverOnlyChanges.round && (
                                            <ServerOnlyChangeDisplay
                                                fieldLabel="ラウンド"
                                                initial={conflict.serverOnlyChanges.round.initial}
                                                server={conflict.serverOnlyChanges.round.server}
                                            />
                                        )}
                                        {conflict.serverOnlyChanges.playerA && (
                                            <ServerOnlyChangeDisplay
                                                fieldLabel="選手A"
                                                initial={conflict.serverOnlyChanges.playerA.initial}
                                                server={conflict.serverOnlyChanges.playerA.server}
                                            />
                                        )}
                                        {conflict.serverOnlyChanges.playerB && (
                                            <ServerOnlyChangeDisplay
                                                fieldLabel="選手B"
                                                initial={conflict.serverOnlyChanges.playerB.initial}
                                                server={conflict.serverOnlyChanges.playerB.server}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * 変更値を表示するための共通バッジコンポーネント (枠線なし)
// ... (ValueBadge is unchanged) ...
 */
function ValueBadge({
    text,
    className,
}: {
    text: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md font-mono text-xs font-medium truncate",
                className,
            )}
        >
            {text}
        </span>
    );
}


function ConflictFieldDisplay({
    fieldLabel,
    draft,
    server,
}: {
    fieldLabel: string;
    draft: string;
    server: string;
    draftLabel?: string;
}) {
    return (
        <div className="grid grid-cols-[minmax(100px,_1fr)_minmax(140px,_1.2fr)_auto_minmax(140px,_1.2fr)] gap-x-3 text-sm items-center pt-2">
            <span className="font-medium text-gray-700 truncate">{fieldLabel}</span>
            <ValueBadge text={draft} />
            <ArrowRight className="w-4 h-4 text-red-500" />
            <ValueBadge
                text={server}
                className="bg-red-50 text-red-700 font-semibold"
            />
        </div>
    );
}

function ServerOnlyChangeDisplay({
    fieldLabel,
    initial,
    server,
}: {
    fieldLabel: string;
    initial: string;
    server: string;
}) {
    return (
        <div className="grid grid-cols-[minmax(100px,_1fr)_minmax(140px,_1.2fr)_auto_minmax(140px,_1.2fr)] gap-x-3 text-sm items-center pt-2">
            <span className="font-medium text-gray-700 truncate">{fieldLabel}</span>
            <ValueBadge text={initial} />
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <ValueBadge
                text={server}
                className="bg-gray-100 text-gray-800 font-semibold" 
            />
        </div>
    );
}