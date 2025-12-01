"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { useSyncStore } from "@/store/use-sync-store";
import { db as localDB } from "@/lib/db";
import { AlertTriangle, Server, Smartphone } from "lucide-react";
import isEqual from "lodash/isEqual";
import isObject from "lodash/isObject";

// 差分計算用ヘルパー
interface DiffItem {
    path: string;
    localValue: unknown;
    cloudValue: unknown;
}

const getDiff = (local: unknown, cloud: unknown, path = ""): DiffItem[] => {
    const diffs: DiffItem[] = [];

    // オブジェクトでない場合は比較して終了
    if (!isObject(local) || !isObject(cloud)) {
        if (!isEqual(local, cloud)) {
            return [{ path, localValue: local, cloudValue: cloud }];
        }
        return [];
    }

    const localObj = local as Record<string, unknown>;
    const cloudObj = cloud as Record<string, unknown>;

    const allKeys = Array.from(new Set([...Object.keys(localObj), ...Object.keys(cloudObj)]));

    // 無視するキー
    const ignoredKeys = ["isSynced", "createdAt", "updatedAt", "_deleted", "id", "organizationId", "tournamentId"];

    for (const key of allKeys) {
        if (ignoredKeys.includes(key)) continue;

        const val1 = localObj[key];
        const val2 = cloudObj[key];
        const currentPath = path ? `${path}.${key}` : key;

        if (isObject(val1) && isObject(val2) && !Array.isArray(val1) && !Array.isArray(val2)) {
            diffs.push(...getDiff(val1, val2, currentPath));
        } else if (!isEqual(val1, val2)) {
            diffs.push({
                path: currentPath,
                localValue: val1,
                cloudValue: val2,
            });
        }
    }
    return diffs;
};

const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return "(なし)";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
};

// コレクション名の型定義
type DBCollectionName = 'matches' | 'tournaments' | 'matchGroups' | 'teamMatches' | 'teams';

const isValidCollection = (col: string): col is DBCollectionName => {
    return ['matches', 'tournaments', 'matchGroups', 'teamMatches', 'teams'].includes(col);
};

export function ConflictResolutionDialog() {
    const { conflict, setConflict } = useSyncStore();

    if (!conflict) return null;

    const diffs = getDiff(conflict.localData, conflict.cloudData);

    const handleUseCloud = async () => {
        if (!conflict) return;

        try {
            const { collection, localData, cloudData } = conflict;

            if (isValidCollection(collection)) {
                const table = localDB[collection];
                const lData = localData as Record<string, unknown>;
                const cData = cloudData as Record<string, unknown>;

                // 共通の必須フィールドを持つ型として扱う
                // Dexieのputはジェネリクスを受け取るが、ここでは動的なので
                // 必要なプロパティを手動で合成する
                const dataToSave = {
                    ...cData,
                    organizationId: lData.organizationId,
                    tournamentId: lData.tournamentId,
                    isSynced: true,
                    id: lData.id, // Keep local ID
                    matchGroupId: lData.matchGroupId,
                };

                // 型安全性を確保するために、各テーブルの型に合わせてキャストするか、
                // あるいは @ts-expect-error を使用して意図的な型不一致を許容する。
                // ここでは、dataToSaveが各テーブルの要件を満たしていることを前提とする。
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - Dynamic table access and generic put
                await table.put(dataToSave);
            } else {
                console.error("Invalid collection name:", collection);
            }
            setConflict(null);
        } catch (error) {
            console.error("Failed to resolve conflict (Use Cloud):", error);
        }
    };

    const handleKeepLocal = () => {
        // ローカル維持：何もしない（後で送信）
        setConflict(null);
    };

    return (
        <Dialog open={!!conflict} onOpenChange={(open) => !open && setConflict(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-none shadow-2xl">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            データの競合が発生しました
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-600 ml-11">
                        クラウド上でデータが更新されましたが、あなたの端末にも未送信の変更があります。
                        どちらのデータを採用するか選択してください。
                    </DialogDescription>
                </div>

                {/* Body (Diff Viewer) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-4 pl-2">変更項目</div>
                            <div className="col-span-4 flex items-center gap-2 text-orange-600">
                                <Smartphone className="w-3.5 h-3.5" />
                                あなたの変更 (Local)
                            </div>
                            <div className="col-span-4 flex items-center gap-2 text-blue-600">
                                <Server className="w-3.5 h-3.5" />
                                クラウドの変更 (Cloud)
                            </div>
                        </div>

                        {/* Diff Items */}
                        <div className="divide-y divide-gray-100">
                            {diffs.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 italic">
                                    表示上の差異はありません (メタデータのみの変更)
                                </div>
                            ) : (
                                diffs.map((diff, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-gray-50 transition-colors group">
                                        <div className="col-span-4 font-medium text-gray-700 break-words flex items-center pl-2">
                                            {diff.path}
                                        </div>
                                        <div className="col-span-4 bg-orange-50/50 text-orange-800 rounded-md p-2 border border-orange-100 group-hover:bg-orange-50 transition-colors break-words">
                                            {formatValue(diff.localValue)}
                                        </div>
                                        <div className="col-span-4 bg-blue-50/50 text-blue-800 rounded-md p-2 border border-blue-100 group-hover:bg-blue-50 transition-colors break-words">
                                            {formatValue(diff.cloudValue)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-400 text-center">
                        ※ ID: {conflict.id} / Collection: {conflict.collection}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleKeepLocal}
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                    >
                        <Smartphone className="w-4 h-4 mr-2" />
                        ローカルを維持
                        <span className="ml-1 text-xs opacity-70">(後で上書き送信)</span>
                    </Button>
                    <Button
                        onClick={handleUseCloud}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                    >
                        <Server className="w-4 h-4 mr-2" />
                        クラウドを適用
                        <span className="ml-1 text-xs opacity-70">(ローカル破棄)</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
