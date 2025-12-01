"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";
import { useSyncStore } from "@/store/use-sync-store";
import { db as localDB } from "@/lib/db";

export function ConflictResolutionDialog() {
    const { conflict, setConflict } = useSyncStore();

    if (!conflict) return null;

    const handleUseCloud = async () => {
        if (!conflict) return;

        try {
            const { collection, localData, cloudData } = conflict;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const table = (localDB as any)[collection];

            if (table) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cData = cloudData as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lData = localData as any;

                await table.put({
                    ...cData,
                    organizationId: lData.organizationId,
                    tournamentId: lData.tournamentId,
                    isSynced: true,
                    id: lData.id, // Keep local ID
                    // TeamMatchの場合、matchGroupIdが必要だが、cloudDataに含まれているか？
                    // useFirestoreSync側で補完しているが、ここでも必要なら補完するロジックがいる。
                    // ただし、cloudDataはFirestoreのデータそのもの。
                    // TeamMatchの場合、親のIDが必要。
                    // useFirestoreSyncでsetConflictする際に、cloudDataに親IDを含めるか、
                    // あるいはここで補完するか。
                    // 簡易的に、localDataから必要な外部キーを引き継ぐ。
                    matchGroupId: lData.matchGroupId,
                });
            }
            setConflict(null);
        } catch (error) {
            console.error("Failed to resolve conflict (Use Cloud):", error);
        }
    };

    const handleKeepLocal = () => {
        // ローカルデータを維持する場合、何もしない（競合状態をクリアするだけ）
        // ただし、次の同期タイミングでまた競合が出る可能性がある。
        // isSynced: false のままなので、useFirestoreSyncのロジックでは
        // 「localData && !localData.isSynced」が真となり、再度競合が出る。
        // これを防ぐには？
        // 1. isSynced: true にする -> ローカルの変更がクラウドに上書きされたとみなされる（未送信データとして扱われなくなる）
        //    -> uploadResults で送信されなくなる。これはNG。
        // 2. 一時的に競合を無視するフラグを立てる？
        // 3. ユーザーが「ローカル維持」を選んだ場合、即座に uploadResults を呼ぶ？
        //    -> そうすればクラウドが更新され、競合が解消する（はず）。
        //    -> しかし、uploadResultsは全件送信。
        //    -> ここでは「ローカル維持」＝「私の変更が正しいから、後で送信する」という意思表示。
        //    -> なので、競合ダイアログを閉じるだけでよいが、再度 onSnapshot が走るとまた出る。
        //    -> onSnapshot はデータ変更時のみ発火する。
        //    -> なので、クラウド側が変わらなければ、再度発火はしない。
        //    -> ただし、初期ロード時やリロード時は出る。
        //    -> 一旦これでよしとする。
        setConflict(null);
    };

    return (
        <Dialog open={!!conflict} onOpenChange={(open) => !open && setConflict(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>データの競合を検知しました</DialogTitle>
                    <DialogDescription>
                        クラウド上のデータが更新されましたが、あなたの端末には未送信の変更があります。
                        どちらのデータを使用しますか？
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <div className="text-sm text-gray-500">
                        <p>対象: {conflict.collection} (ID: {conflict.id})</p>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleKeepLocal}>
                        ローカルデータを維持
                        <span className="text-xs ml-1">(後で送信)</span>
                    </Button>
                    <Button onClick={handleUseCloud}>
                        クラウドデータを使用
                        <span className="text-xs ml-1">(上書き)</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
