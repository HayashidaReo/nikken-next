/**
 * 同期処理用の共通ユーティリティ関数
 */

interface SyncOptions {
    /** タイムアウト時間（ミリ秒）、デフォルトは 10000ms */
    timeout?: number;
    /** 同期成功時のコールバック */
    onSuccess?: () => void;
    /** 同期失敗時のコールバック */
    onError?: (error: Error) => void;
}

/**
 * クラウド同期処理をタイムアウト付きで実行する共通関数
 * 
 * @param syncTask 実行する同期タスク
 * @param options タイムアウトやコールバック設定
 * @returns 同期タスクの実行結果
 * @throws タイムアウトまたは同期タスクのエラー
 * 
 * @example
 * ```typescript
 * await executeSyncWithTimeout(
 *   async () => {
 *     await repository.save(data);
 *   },
 *   {
 *     timeout: 10000,
 *     onSuccess: () => showSuccess("同期しました"),
 *     onError: (error) => showError("同期失敗しました"),
 *   }
 * );
 * ```
 */
export async function executeSyncWithTimeout<T>(
    syncTask: () => Promise<T>,
    options: SyncOptions = {}
): Promise<T> {
    const {
        timeout = 10000, // デフォルト10秒
        onSuccess,
        onError
    } = options;

    try {
        const result = await Promise.race([
            syncTask(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Sync timeout")), timeout)
            ),
        ]);

        onSuccess?.();
        return result;
    } catch (error) {
        const syncError = error instanceof Error ? error : new Error("Unknown sync error");
        onError?.(syncError);
        throw syncError;
    }
}
