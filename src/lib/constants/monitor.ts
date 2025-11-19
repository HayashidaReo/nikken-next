// Channel names and other monitor-related constants
export const MONITOR_DISPLAY_CHANNEL = "monitor-display-channel";

// Presentation target path used by hooks/components
export const MONITOR_DISPLAY_PATH = "/monitor-display";

// Heartbeat and timeout settings (in milliseconds)
export const HEARTBEAT_INTERVAL_MS = 500; // 0.5秒ごとにハートビートを送信
export const HEARTBEAT_TIMEOUT_MS = 3000; // 3秒間応答がない場合は切断とみなす
export const TIMEOUT_CHECK_INTERVAL_MS = 1000; // 1秒ごとにタイムアウトをチェック

