"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { rowVariants, rowTransition } from "@/lib/animation";

type Props = Omit<ComponentPropsWithoutRef<"div">, "onDrag"> & {
    disabledMotion?: boolean;
};

/**
 * AnimatedListItem
 * - `motion.div` をラップした共通コンポーネント。
 * - list の enter/exit の共通 variants/transition を中央管理する。
 *
 * @param disabledMotion - アニメーションを手動で無効化するブールフラグ。
 *   `true` の場合は `motion.div` ではなく通常の `div` を返します。
 *   テスト環境や、システムの `prefers-reduced-motion` を尊重したい場面、
 *   レンダリング負荷を下げたい場合に利用します。
 *
 * @example
 * <AnimatedListItem disabledMotion={process.env.NODE_ENV === 'test'}>...</AnimatedListItem>
 */
const AnimatedListItem = React.forwardRef<HTMLDivElement, Props>(
    ({ children, className, disabledMotion = false, ...rest }, ref) => {
        const divProps = rest as ComponentPropsWithoutRef<"div">;

        if (disabledMotion) {
            return (
                <div ref={ref} className={className} {...divProps}>
                    {children}
                </div>
            );
        }

        return (
            <motion.div
                ref={ref}
                layout
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={rowTransition}
                className={className}
                {...(rest as HTMLMotionProps<"div">)}
            >
                {children}
            </motion.div>
        );
    }
);

AnimatedListItem.displayName = "AnimatedListItem";

export { AnimatedListItem };
