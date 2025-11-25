import { useEffect } from "react";
import { useMonitorStore } from "@/store/use-monitor-store";
import { useMonitorSender } from "@/hooks/useMonitorSender";

/**
 * モニター表示画面へのデータ同期を自動化するカスタムフック
 * 
 * @description
 * このフックは、`useMonitorStore`の状態変更を監視し、変更があった際に自動的に
 * モニター表示画面（Presentation APIまたはBroadcastChannel経由）へデータを送信します。
 * 
 * **主な機能:**
 * - 試合情報（選手名、スコア、反則数など）の変更を検知
 * - タイマー状態（残り時間、実行中フラグ）の変更を検知
 * - 表示モード（スコアボード、試合結果、団体戦結果）の変更を検知
 * - 公開/非公開状態の変更を検知
 * 
 * **使用方法:**
 * ```tsx
 * function MonitorControlPage() {
 *   useMonitorSync(); // コンポーネント内で呼び出すだけで自動同期が有効化される
 *   // ...
 * }
 * ```
 * 
 * **注意事項:**
 * - このフックは、モニター操作画面（コントロール側）でのみ使用してください
 * - モニター表示画面側では使用しないでください（無限ループの原因になります）
 * - Zustandの`subscribe` APIを使用しているため、コンポーネントの再レンダリングを最小限に抑えます
 * 
 * @see {@link useMonitorStore} - 同期元のストア
 * @see {@link useMonitorSender} - メッセージ送信を担当するフック
 */
export function useMonitorSync() {
    const { sendMessage } = useMonitorSender();

    useEffect(() => {
        // Zustandのsubscribe APIを使用してストアの変更を監視
        // これにより、個別の状態を購読するよりも効率的に変更を検知できる
        const unsubscribe = useMonitorStore.subscribe((state) => {
            const monitorData = state.getMonitorSnapshot();
            sendMessage("data", monitorData);
        });

        // 初回マウント時にもデータを送信
        const initialData = useMonitorStore.getState().getMonitorSnapshot();
        sendMessage("data", initialData);

        // クリーンアップ
        return unsubscribe;
    }, [sendMessage]);
}
