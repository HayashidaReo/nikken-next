// Centralized animation settings for UI elements.
// テスト環境ではアニメーション時間をゼロにしてテストの安定性を確保します。

import type { Transition } from "framer-motion";

const isTest = process.env.NODE_ENV === "test";

export const rowVariants = {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

// framer-motion の Transition 型に合わせて明示的にキャスト
export const rowTransition: Transition = (isTest
    ? { duration: 0 }
    : ({ duration: 0.28, ease: [0.4, 0, 0.2, 1] } as unknown)) as Transition;

const animations = {
    rowVariants,
    rowTransition,
};

export default animations;
