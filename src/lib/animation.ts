// Centralized animation settings for UI elements.
// テスト環境ではアニメーション時間をゼロにしてテストの安定性を確保します。

import type { Transition } from "framer-motion";

const isTest = process.env.NODE_ENV === "test";

export const rowVariants = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

// テスト環境ではアニメーションを無効化し、それ以外は通常のトランジションを使用
export const rowTransition: Transition = isTest
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

const animations = {
    rowVariants,
    rowTransition,
};

export default animations;
