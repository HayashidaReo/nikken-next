"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { rowVariants, rowTransition } from "../../lib/animation";

type Props = Omit<ComponentPropsWithoutRef<"tr">, "onDrag"> & {
    disabledMotion?: boolean;
};

/**
 * AnimatedTableRow
 * - `motion.tr` をラップした共通コンポーネント。
 * - 行アニメーションの variants/transition を中央管理する。
 */
const AnimatedTableRow = React.forwardRef<HTMLTableRowElement, Props>(
    ({ children, className, disabledMotion = false, ...rest }, ref) => {
        const trProps = rest as ComponentPropsWithoutRef<"tr">;

        if (disabledMotion) {
            // アニメーションを無効化したい場合は通常の tr を返す
            return (
                <tr ref={ref} className={className} {...trProps}>
                    {children}
                </tr>
            );
        }

        return (
            <motion.tr
                ref={ref}
                layout
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={rowTransition}
                className={className}
                // motion の型に合わせてキャスト
                {...(trProps as unknown as HTMLMotionProps<"tr">)}
            >
                {children}
            </motion.tr>
        );
    }
);

AnimatedTableRow.displayName = "AnimatedTableRow";

export { AnimatedTableRow };
