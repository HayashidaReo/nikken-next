/**
 * 同期処理の共通ロジック
 */
export async function syncItems<T extends { _deleted?: boolean; id?: number }>(
    items: T[],
    itemName: string,
    getId: (item: T) => string | undefined,
    syncAction: (item: T, id: string) => Promise<void>,
    deleteAction: (item: T, id: string) => Promise<void>,
    markSynced: (item: T) => Promise<void>,
    hardDeleteLocal: (id: string) => Promise<void>
): Promise<number> {
    let successCount = 0;
    for (const item of items) {
        const id = getId(item);
        if (!id) {
            console.error(`[SyncService] ${itemName} has no ID, skipping`, item);
            continue;
        }

        try {
            if (item._deleted) {
                await deleteAction(item, id);
                await hardDeleteLocal(id);
                successCount++;
            } else {
                await syncAction(item, id);
                await markSynced(item);
                successCount++;
            }
        } catch (error) {
            console.error(`[SyncService] Failed to sync ${itemName} ${id}`, error);
        }
    }
    return successCount;
}
