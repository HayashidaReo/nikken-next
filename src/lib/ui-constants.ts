// Visual constants for UI color classes and other shared UI tokens
// Keep as plain strings of Tailwind utility classes so components can compose them directly.

export const SCORE_COLORS = {
    // 勝ち: オレンジ（赤に近づけて目立つように、太字）
    win: "font-bold text-orange-600",
    // 負け: 薄めの青（目立たないように）
    loss: "text-blue-400",
    // 引き分け: 水色（控えめなトーン）
    draw: "text-blue-700",
    // 0-0 未試合: 両方灰色
    unplayed: "text-gray-500",
} as const;

const UI_CONSTANTS = {
    SCORE_COLORS,
};

export default UI_CONSTANTS;
