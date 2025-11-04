/**
 * 試合競合情報表示コンポーネント
 * 保存時・更新時の両ダイアログで使用される競合内容の表示ロジック
 */

interface ConflictDetails {
    matchId: string;
    directConflicts: {
        courtId?: { draft: string; server: string };
        round?: { draft: string; server: string };
        playerA?: { draft: string; server: string };
        playerB?: { draft: string; server: string };
    };
    serverOnlyChanges: {
        courtId?: { initial: string; server: string };
        round?: { initial: string; server: string };
        playerA?: { initial: string; server: string };
        playerB?: { initial: string; server: string };
    };
}

interface ConflictDetailsDisplayProps {
    conflicts: ConflictDetails[];
    draftLabel?: string; // デフォルト: "あなたの編集"
}

/**
 * 競合情報の詳細を表示
 * 複数の試合の競合を一覧表示
 */
export function ConflictDetailsDisplay({
    conflicts,
    draftLabel = "あなたの編集",
}: ConflictDetailsDisplayProps) {
    return (
        <div className="space-y-3">
            {conflicts.map((conflict, index) => {
                const hasDirectConflicts =
                    Object.keys(conflict.directConflicts).length > 0;
                const hasServerOnlyChanges =
                    Object.keys(conflict.serverOnlyChanges).length > 0;

                return (
                    <div
                        key={conflict.matchId || index}
                        className="border rounded-lg p-3 bg-muted/50 space-y-3"
                    >
                        <div className="font-semibold text-sm">試合 #{index + 1}</div>

                        {hasDirectConflicts && (
                            <div className="space-y-2 border-l-4 border-destructive pl-3">
                                <div className="font-semibold text-sm text-destructive">
                                    あなたの編集との競合
                                </div>

                                {conflict.directConflicts.courtId && (
                                    <ConflictFieldDisplay
                                        fieldLabel="コート"
                                        draft={conflict.directConflicts.courtId.draft}
                                        server={conflict.directConflicts.courtId.server}
                                        draftLabel={draftLabel}
                                    />
                                )}

                                {conflict.directConflicts.round && (
                                    <ConflictFieldDisplay
                                        fieldLabel="ラウンド"
                                        draft={conflict.directConflicts.round.draft}
                                        server={conflict.directConflicts.round.server}
                                        draftLabel={draftLabel}
                                    />
                                )}

                                {conflict.directConflicts.playerA && (
                                    <ConflictFieldDisplay
                                        fieldLabel="選手A"
                                        draft={conflict.directConflicts.playerA.draft}
                                        server={conflict.directConflicts.playerA.server}
                                        draftLabel={draftLabel}
                                    />
                                )}

                                {conflict.directConflicts.playerB && (
                                    <ConflictFieldDisplay
                                        fieldLabel="選手B"
                                        draft={conflict.directConflicts.playerB.draft}
                                        server={conflict.directConflicts.playerB.server}
                                        draftLabel={draftLabel}
                                    />
                                )}
                            </div>
                        )}

                        {hasServerOnlyChanges && (
                            <div className="space-y-2 border-l-4 border-yellow-500 pl-3">
                                <div className="font-semibold text-sm text-yellow-700">
                                    他端末のみで変更
                                </div>

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
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/**
 * 直接競合フィールドの表示
 * ユーザーの編集値と他端末の最新値を比較表示
 */
function ConflictFieldDisplay({
    fieldLabel,
    draft,
    server,
    draftLabel,
}: {
    fieldLabel: string;
    draft: string;
    server: string;
    draftLabel: string;
}) {
    return (
        <div className="text-sm">
            <span className="font-medium">{fieldLabel}:</span>
            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                <div>
                    <span className="text-muted-foreground">{draftLabel}:</span>{" "}
                    <span className="font-medium">{draft}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">他端末の最新:</span>{" "}
                    <span className="font-medium">{server}</span>
                </div>
            </div>
        </div>
    );
}

/**
 * サーバーのみの変更フィールドの表示
 * 初期値から他端末による変更を表示
 */
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
        <div className="text-sm">
            <span className="font-medium">{fieldLabel}:</span>
            <div className="ml-4 grid grid-cols-2 gap-2 mt-1">
                <div>
                    <span className="text-muted-foreground">初期値:</span>{" "}
                    <span className="font-medium">{initial}</span>
                </div>
                <div>
                    <span className="text-muted-foreground">他端末の最新:</span>{" "}
                    <span className="font-medium">{server}</span>
                </div>
            </div>
        </div>
    );
}
