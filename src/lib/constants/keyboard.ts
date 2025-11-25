export const DOUBLE_TAP_INTERVAL_MS = 300;

export type ShortcutAction = "toggleTimer" | "toggleA" | "toggleB" | "incScore" | "incFoul" | "enter" | "togglePublic";

// キーを action にマップする（すぐに置き換え可能）
export const KEY_MAP: Record<string, ShortcutAction> = {
    " ": "toggleTimer",
    a: "toggleA",
    b: "toggleB",
    s: "incScore",
    z: "incFoul",
    enter: "enter",
    p: "togglePublic",
};
